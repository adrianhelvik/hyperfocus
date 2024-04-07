import classes from "./styles.module.css";
import Deck from "src/libs/store/Deck";
import api from "src/libs/api";
import Portal from "src/libs/store/Portal";
import Color from "color";
import { BoardParam } from "src/libs/store/Board";
import Card from "src/libs/store/Card";
import { styleMovedCard } from "./styleMovedCard";
import { possiblyPerformHoverSwap } from "./possiblyPerformHoverSwap";
import { horizontalMiddle } from "./domUtils";

export default function createBoardView(opts: {
    root: HTMLElement;
    board: BoardParam;
}) {
    buildInterface(opts.root, opts.board);
    return () => clearInterface(opts.root);
}

function findClosestDeck(deckElements: HTMLElement[], x: number) {
    let prev = deckElements[0];
    for (let i = 1; i < deckElements.length; i++) {
        const node = deckElements[i];
        const rect = node.getBoundingClientRect();

        if (x < rect.left) return prev;
        prev = node;
    }
    return deckElements[deckElements.length - 1] ?? null;
}

function clearInterface(root: HTMLElement) {
    root.innerHTML = "";
    root.classList.remove(classes.board);
    document.body.classList.remove(classes.body);
}

async function buildInterface(root: HTMLElement, board: BoardParam) {
    const deckElements = [];
    root.classList.add(classes.board);
    document.body.classList.add(classes.body);

    for (const child of board.children) {
        const deckElement = document.createElement("div");
        deckElements.push(deckElement);
        deckElement.className = classes.deck;
        const titleNode = document.createElement("h2");
        titleNode.textContent = child.title;
        deckElement.append(titleNode);
        const deck =
            child.type === "deck"
                ? (child as Deck)
                : ((child as Portal).target as Deck);
        if (deck.color) {
            deckElement.style.setProperty("--deck-color", deck.color);
            deckElement.style.setProperty(
                "--deck-text-color",
                Color(deck.color).blacken(0.7).isDark() ? "white" : "black"
            );
        }
        deckElement.dataset.deckId = deck.deckId;

        for (const card of deck?.cards ?? []) {
            buildCardForDeck({
                root,
                card,
                deckElement,
                deckElements,
            });
        }

        root.append(deckElement);
    }
}

function buildCardForDeck({
    root,
    card,
    deckElement,
    deckElements,
}: {
    root: HTMLElement,
    card: Card;
    deckElement: HTMLElement;
    deckElements: HTMLElement[];
}) {
    const cardElement = document.createElement("div");
    deckElement.append(cardElement);

    cardElement.dataset.cardId = card.cardId;
    cardElement.className = classes.card;

    const cardContentElement = document.createElement("div");
    cardContentElement.className = classes.cardContent;
    cardContentElement.textContent = card.title;
    cardElement.append(cardContentElement);

    const placeholderNode = document.createElement("div");
    placeholderNode.className = classes.cardPlaceholder;
    let hoverDeck: HTMLElement = deckElement;

    cardElement.addEventListener("mousedown", (event) => {
        event.preventDefault();
        root.classList.add(classes.isMovingCard);
        cardElement.parentElement.classList.add(classes.hoverDeck);

        const {
            top,
            left,
            width,
            height: cardHeight,
        } = cardElement.getBoundingClientRect();

        const insetX = event.clientX - left;
        const insetY = event.clientY - top;

        cardElement.classList.add(classes.movingCard);

        styleMovedCard({
            clientX: event.clientX,
            clientY: event.clientY,
            cardElement,
            insetX,
            insetY,
        });

        cardElement.replaceWith(placeholderNode);
        document.body.appendChild(cardElement);

        cardElement.style.width = `${width}px`;

        Object.assign(placeholderNode.style, {
            width: `${width}px`,
            height: `${cardHeight}px`,
        });

        const onMouseUp = (_e: MouseEvent) => {
            cardElement.remove();
            cardElement.removeAttribute("style");
            placeholderNode.replaceWith(cardElement);
            cardElement.classList.remove(classes.movingCard);
            root.classList.remove(classes.isMovingCard);

            const index = Array.from(hoverDeck.children)
                .filter((e: HTMLElement) => e.dataset.cardId)
                .findIndex((e) => e === cardElement);

            api.moveCard({
                cardId: cardElement.dataset.cardId,
                target: hoverDeck.dataset.deckId,
                index,
            });

            deckElements.forEach(e => e.classList.remove(classes.hoverDeck));

            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mousemove", onMouseMove);
        };

        const onMouseMove = ({ clientX, clientY }: MouseEvent) => {
            styleMovedCard({ clientX, clientY, cardElement, insetX, insetY });
            hoverDeck = findClosestDeck(deckElements, horizontalMiddle(cardElement))
            const didSwap = possiblyPerformHoverSwap({
                hoverDeck,
                clientY,
                insetY,
                cardHeight,
                cardElement,
                placeholderNode,
            });

            if (didSwap) {
                deckElements.forEach(e => e.classList.remove(classes.hoverDeck));
                hoverDeck.classList.add(classes.hoverDeck);
            }
        };

        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);
    });
}
