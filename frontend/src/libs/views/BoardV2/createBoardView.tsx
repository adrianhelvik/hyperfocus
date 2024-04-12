import classes from "./styles.module.css";
import Deck, { DeckParam } from "src/libs/store/Deck";
import api from "src/libs/api";
import Portal from "src/libs/store/Portal";
import Color from "color";
import { BoardParam } from "src/libs/store/Board";
import Card from "src/libs/store/Card";
import { styleMovedCard } from "./styleMovedCard";
import { possiblyPerformHoverSwap } from "./possiblyPerformHoverSwap";
import { horizontalMiddle } from "./domUtils";
import animate from "./animate";

export default function createBoardView(opts: {
    root: HTMLElement;
    board: BoardParam;
}) {
    const boardView = new BoardView(opts.root, opts.board);
    boardView.buildInterface();
    return () => clearInterface(opts.root);
}

class BoardView {
    constructor(private root: HTMLElement, private board: BoardParam) {
    }

    async buildInterface() {
        const deckElements = [];
        this.root.classList.add(classes.board);
        document.body.classList.add(classes.body);

        for (const child of this.board.children) {
            const deckElement = document.createElement("div");
            deckElements.push(deckElement);
            deckElement.className = classes.deck;

            deckElement.append(createDeckTitleNode({
                deckElement,
                child
            }));

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

            const cardsContainer = document.createElement("div");
            cardsContainer.dataset.cardsContainer = deck.deckId;
            cardsContainer.className = classes.cardsContainer;
            deckElement.append(cardsContainer);

            for (const card of deck?.cards ?? []) {
                cardsContainer.append(
                    buildCardForDeck({
                        root: this.root,
                        card,
                        deckElement,
                        deckElements,
                    }));
            }

            this.root.append(deckElement);

            deckElement.append(createInsertField({
                root: this.root,
                deckElement,
                deckElements,
                deck,
            }));
        }
    }
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


function createInsertField({ root, deckElement, deckElements, deck }: { root: HTMLElement, deckElement: HTMLElement, deckElements: HTMLElement[], deck: DeckParam }) {
    const form = document.createElement("form");
    form.classList.add(classes.newCardContainer);

    const input = document.createElement("input");
    input.classList.add(classes.newCardInput);
    input.placeholder = "Add card";
    form.append(input);

    const button = document.createElement("button");
    button.classList.add(classes.newCardButton);
    button.textContent = "Add";
    form.append(button);

    form.onsubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const title = input.value;
        input.value = "";
        const { cardId } = await api.addCard({
            title,
            deckId: deck.deckId,
        });
        const card = {
            title,
            cardId,
            images: [],
            setTitle() { },
        };
        deckElement.querySelector("[data-cards-container]").append(buildCardForDeck({
            root,
            card,
            deckElement,
            deckElements,
        }));
    }

    return form;
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

            const index = Array.from(hoverDeck.querySelectorAll("[data-card-id]"))
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

    return cardElement;
}

function createDeckTitleNode({ child, deckElement }: { child: Deck | Portal, deckElement: HTMLElement }) {
    const titleNode = document.createElement("h2");
    titleNode.textContent = child.title;

    let deltaY = 0;
    let deltaX = 0;

    const render = () => {
        deckElement.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px)`;
    };

    const onMouseMove = (e: MouseEvent) => {
        deltaX += e.movementX;
        deltaY += e.movementY;
        render();
    };

    const onMouseUp = (e: MouseEvent) => {
        animate({
            values: {
                x: [deltaX, 0],
                y: [deltaY, 0],
            },
            time: 300,
            fn: ({ x, y }) => {
                console.log("render");
                deltaX = x;
                deltaY = y;
                console.log(deltaX, deltaY);
                render();
            }
        });

        render();

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    titleNode.onmousedown = e => {
        deltaX += e.movementX;
        deltaY += e.movementY;
        render();

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }

    return titleNode;
}
