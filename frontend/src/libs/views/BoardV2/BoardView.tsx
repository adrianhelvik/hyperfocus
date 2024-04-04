import classes from "./styles.module.css";
import Deck from "src/libs/store/Deck";
import api from "src/libs/api";
import Portal from "src/libs/store/Portal";

export default class BoardView {
    constructor(private root: HTMLElement, private boardId: string) {
        this.buildInterface();
    }

    deckNodes = [];

    async buildInterface() {
        this.root.classList.add(classes.board);
        document.body.classList.add(classes.body);
        const board = await api.getBoard({ boardId: this.boardId });

        for (const child of board.children) {
            const deckNode = document.createElement("div");
            this.deckNodes.push(deckNode);
            deckNode.className = classes.deck;
            const titleNode = document.createElement("h2");
            titleNode.textContent = child.title;
            deckNode.append(titleNode);
            const deck = child.type === "deck" ? child as Deck : (child as Portal).target as Deck;
            deckNode.style.setProperty('--deck-color', deck.color);
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
                let hoverDeck = deckNode;

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

                        hoverDeck = this.findClosestDeck(e.clientX);
                        const { bottom: deckBottom, left: deckLeft, width: deckWidth } = hoverDeck.getBoundingClientRect();
                        const deckCenter = (deckLeft + deckWidth / 2) | 0;

                        if (!hoverDeck) return;

                        const topY = e.clientY - insetY;
                        const bottomY = e.clientY - insetY + cardHeight;

                        const topElement = this.findCardAt(deckCenter, topY, cardNode);
                        const bottomElement = this.findCardAt(deckCenter, bottomY, cardNode);

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

            this.root.append(deckNode);
        }
    }

    unmount() {
        this.root.innerHTML = "";
        this.root.classList.remove(classes.board);
        document.body.classList.remove(classes.body);
    }

    findClosestDeck(x: number) {
        let prev = this.deckNodes[0];
        for (let i = 1; i < this.deckNodes.length; i++) {
            const node = this.deckNodes[i];
            const rect = node.getBoundingClientRect();

            if (x < rect.left) return prev;
            prev = node;
        }
        return this.deckNodes[this.deckNodes.length - 1] ?? null;
    }

    findCardAt(x: number, y: number, excludedCardNode: HTMLElement): HTMLElement {
        return Array.from(document.elementsFromPoint(x, y))
            .find(e => e instanceof HTMLElement && !excludedCardNode.contains(e) && e.dataset.cardId) as HTMLElement;
    }
}

function highlight(element: HTMLElement, color = "red") {
    if (!element) return;
    element.style.outline = `1px solid ${color}`;

    setTimeout(() => {
        element.style.outline = null;
    }, 500);
}

function debugPoint(x: number, y: number, msDuration = 300) {
    const div = document.createElement("div");
    Object.assign(div.style, {
        position: "fixed",
        top: `${y}px`,
        left: `${x}px`,
        pointerEvents: "none",
        borderRadius: "5px",
        width: "5px",
        height: "5px",
        backgroundColor: "rebeccapurple",
        zIndex: "100000",
    });
    div.dataset.isDebugPoint = "true";
    document.body.append(div);

    fadeOutInMillis(div, msDuration);
}

function fadeOutInMillis(div: HTMLElement, msDuration: number) {
    const start = Date.now();

    const loop = () => {
        const progress = Math.min((Date.now() - start) / msDuration, 1);
        div.style.opacity = String(1 - progress);
        if (progress === 1) {
            div.remove();
        } else {
            af = requestAnimationFrame(loop);
        }
    };

    let af = requestAnimationFrame(loop);
}

function mid(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2;
}
