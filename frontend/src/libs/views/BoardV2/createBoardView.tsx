import classes from "./styles.module.css";
import Deck from "src/libs/store/Deck";
import api from "src/libs/api";
import Portal from "src/libs/store/Portal";
import Color from "color";

export default function createBoardView(root: HTMLElement, boardId: string) {
    buildInterface(root, boardId);
    return () => clearInterface(root);

}

function findClosestDeck(deckNodes: HTMLElement[], x: number) {
    let prev = deckNodes[0];
    for (let i = 1; i < deckNodes.length; i++) {
        const node = deckNodes[i];
        const rect = node.getBoundingClientRect();

        if (x < rect.left) return prev;
        prev = node;
    }
    return deckNodes[deckNodes.length - 1] ?? null;
}

function findCardAt(x: number, y: number, excludedCardNode: HTMLElement): HTMLElement {
    return Array.from(document.elementsFromPoint(x, y))
        .find(e => e instanceof HTMLElement && !excludedCardNode.contains(e) && e.dataset.cardId) as HTMLElement;
}

function mid(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2;
}


function clearInterface(root: HTMLElement) {
    root.innerHTML = "";
    root.classList.remove(classes.board);
    document.body.classList.remove(classes.body);
}


async function buildInterface(root: HTMLElement, boardId: string) {
    const deckNodes = [];
    root.classList.add(classes.board);
    document.body.classList.add(classes.body);
    const board = await api.getBoard({ boardId });

    for (const child of board.children) {
        const deckNode = document.createElement("div");
        deckNodes.push(deckNode);
        deckNode.className = classes.deck;
        const titleNode = document.createElement("h2");
        titleNode.textContent = child.title;
        deckNode.append(titleNode);
        const deck = child.type === "deck" ? child as Deck : (child as Portal).target as Deck;
        if (deck.color) {
            deckNode.style.setProperty('--deck-color', deck.color);
            deckNode.style.setProperty('--deck-text-color', Color(deck.color).blacken(0.7).isDark() ? 'white' : 'black');
        }
        deckNode.dataset.deckId = deck.deckId;

        for (const card of deck?.cards ?? []) {
            const cardNode = document.createElement("div");
            deckNode.append(cardNode);

            cardNode.dataset.cardId = card.cardId;
            cardNode.className = classes.card;

            const cardContentElement = document.createElement("div");
            cardContentElement.className = classes.cardContent;
            cardContentElement.textContent = card.title;
            cardNode.append(cardContentElement);

            const placeholderNode = document.createElement("div");
            placeholderNode.className = classes.cardPlaceholder;
            let hoverDeck: HTMLElement = deckNode;

            cardNode.addEventListener("mousedown", e => {
                e.preventDefault();

                const { top, left, width, height: cardHeight } = cardNode.getBoundingClientRect();

                const insetX = e.clientX - left;
                const insetY = e.clientY - top;

                const styleNode = (e: MouseEvent) => {
                    Object.assign(cardNode.style, {
                        position: "fixed",
                        top: 0,
                        left: 0,
                        transform: [
                            `translateX(${e.clientX - insetX}px)`,
                            `translateY(${e.clientY - insetY}px)`,
                        ].join(" "),
                    });
                }

                cardNode.classList.add(classes.movingCard);

                styleNode(e);

                cardNode.replaceWith(placeholderNode);
                document.body.appendChild(cardNode);

                cardNode.style.width = `${width}px`;

                Object.assign(placeholderNode.style, {
                    width: `${width}px`,
                    height: `${cardHeight}px`,
                });

                const onMouseUp = (_e: MouseEvent) => {
                    cardNode.remove();
                    cardNode.removeAttribute("style");
                    placeholderNode.replaceWith(cardNode);
                    cardNode.classList.remove(classes.movingCard);

                    const index = Array.from(hoverDeck.children)
                        .filter((e: HTMLElement) => e.dataset.cardId)
                        .findIndex(e => e === cardNode);

                    api.moveCard({
                        cardId: cardNode.dataset.cardId,
                        target: hoverDeck.dataset.deckId,
                        index,
                    });

                    document.removeEventListener("mouseup", onMouseUp);
                    document.removeEventListener("mousemove", onMouseMove);
                };

                const onMouseMove = (e: MouseEvent) => {
                    styleNode(e);

                    hoverDeck = findClosestDeck(deckNodes, e.clientX);
                    const { bottom: deckBottom, left: deckLeft, width: deckWidth } = hoverDeck.getBoundingClientRect();
                    const deckCenter = (deckLeft + deckWidth / 2) | 0;

                    if (!hoverDeck) return;

                    const topY = e.clientY - insetY;
                    const bottomY = e.clientY - insetY + cardHeight;

                    const topElement = findCardAt(deckCenter, topY, cardNode);
                    const bottomElement = findCardAt(deckCenter, bottomY, cardNode);

                    if (topElement && e.clientY - insetY <= mid(topElement)) {
                        topElement.parentNode.insertBefore(placeholderNode, topElement);
                    } else if (bottomElement && e.clientY - insetY + cardHeight >= mid(bottomElement)) {
                        bottomElement.parentNode.insertBefore(placeholderNode, bottomElement);
                    } else if (!bottomElement && e.clientY - insetY + cardHeight >= deckBottom) {
                        hoverDeck.append(placeholderNode);
                    }
                };

                document.addEventListener("mouseup", onMouseUp);
                document.addEventListener("mousemove", onMouseMove);
            });
        }

        root.append(deckNode);
    }
}
