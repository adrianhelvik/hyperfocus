import { replaceWithInputAndFocusAtCaretPosition } from "./replaceWithInputAndFocusAtCaretPosition";
import { possiblyPerformHoverSwap } from "./possiblyPerformHoverSwap";
import startScrollWhenNearEdges from "./startScrollWhenNearEdges";
import { makeTextAreaAutoGrow } from "./makeTextAreaAutoGrow";
import { distanceBetween } from "./distanceBetween";
import { findClosestDeck } from "./findClosestDeck";
import { setLinkableText } from "./setLinkableText";
import { styleMovedCard } from "./styleMovedCard";
import { CleanupHooks } from "./CleanupHooks";
import { horizontalMiddle } from "./domUtils";
import { Board, Card } from "src/libs/types";
import classes from "./styles.module.css";
import onlyOnceFn from "./onlyOnceFn";
import api from "src/libs/api";

const CARD_ANIMATION_TIME = 300;

export default function createCardElement({
  cleanupHooks,
  deckElements,
  deckElement,
  board,
  root,
  card,
}: {
  deckElements: HTMLElement[];
  cleanupHooks: CleanupHooks;
  deckElement: HTMLElement;
  root: HTMLElement;
  board: Board,
  card: Card;
}) {
  let editSource: "keyboard" | "mouse" = "mouse";

  const cardElement = document.createElement("div");
  cardElement.dataset.cardId = card.cardId ?? undefined;
  cardElement.className = classes.card;

  const cardInputElement = document.createElement("textarea");
  const cleanupAutoGrow = makeTextAreaAutoGrow(cardInputElement);
  cardInputElement.className = classes.cardInput;

  // XXX: When a card is deleted, these will still stick around.
  cleanupHooks.add(cleanupAutoGrow);

  cardInputElement.onmousedown = (e) => {
    e.stopPropagation();
  };

  const switchToInput = (e: MouseEvent | null) => {
    if (e) editSource = "mouse";
    else editSource = "keyboard";
    cardElement.dataset.editSource = editSource;

    replaceWithInputAndFocusAtCaretPosition({
      sourceElement: cardContentElement,
      inputElement: cardInputElement,
      clientX: e ? e.clientX : null,
      clientY: e ? e.clientY : null,
    });
  };

  cardInputElement.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      cardInputElement.value = cardInputElement.value.trim();
      e.preventDefault();
      cardInputElement.blur();
    }
  };

  cardInputElement.onblur = () => {
    setLinkableText(cardContentElement, cardInputElement.value);
    cardInputElement.replaceWith(cardContentElement);
    if (cardInputElement.value === "") {
      cardElement.remove();
      api.deleteCard({
        cardId: card.cardId,
      });
      board.children.find((it) => {
        if ("deckId" in it && it.deckId === deckElement.dataset.deckId) {
          const index = it.cards.findIndex((it) => it.cardId === card.cardId);

          if (index !== -1) {
            it.cards.splice(index, 1);
          }
        }
        // TODO: Handle removing empty cards from portals
      });
    } else {
      api.setCardTitle({
        cardId: card.cardId,
        title: cardInputElement.value,
      });
      if (editSource === "keyboard") {
        cardContentElement.focus();
      }
    }
  };

  const cardContentElement = document.createElement("div");
  cardContentElement.className = classes.cardContent;
  cardContentElement.tabIndex = 0;
  setLinkableText(cardContentElement, card.title);
  cardElement.append(cardContentElement);

  cardContentElement.onkeydown = (e) => {
    if (!(e.target instanceof HTMLElement)) return;

    switch (e.key) {
      case "Enter": {
        if (e.target.tagName === "A") break;
        e.preventDefault();
        switchToInput(null);
        break;
      }
      // TODO:
      // - Left: Select card to left
      // - Right: Select card to left
      // - Up: Select card above
      // - Down: Select card below
      // - alt-Left: Move card left
      // - alt-Right: Move card right
      // - alt-Up: Move card up
      // - alt-Down: Move card down
    }
  };

  cardContentElement.onfocus = () => {
    editSource = "keyboard";
    cardElement.dataset.editSource = editSource;
  };

  const placeholderNode = document.createElement("div");
  placeholderNode.className = classes.cardPlaceholder;
  let hoverDeck: HTMLElement = deckElement;

  let didMove = false;
  let initialCoords = { x: -1, y: -1 };
  let prevMoveCoords: { clientX: number; clientY: number };

  cardElement.addEventListener("mousedown", (event) => {
    // Ignore anything but left clicks
    if (event.button !== 0) return;

    initialCoords = { x: event.clientX, y: event.clientY };

    event.preventDefault();

    const {
      top,
      left,
      width,
      height: cardHeight,
    } = cardElement.getBoundingClientRect();

    const insetX = event.clientX - left;
    const insetY = event.clientY - top;

    let stopScroll: (() => void) | null = null;

    const onMoveBegin = () => {
      didMove = true;

      cleanupHooks.run();

      root.classList.add(classes.isMovingCard);
      cardElement.parentElement?.parentElement?.classList.add(
        classes.hoverDeck
      );

      stopScroll = startScrollWhenNearEdges(root);

      cardElement.replaceWith(placeholderNode);
      document.body.appendChild(cardElement);
      cardElement.classList.add(classes.movingCard);

      styleMovedCard({
        clientX: event.clientX,
        clientY: event.clientY,
        cardElement,
        insetX,
        insetY,
      });

      cardElement.style.width = `${width}px`;

      Object.assign(placeholderNode.style, {
        width: `${width}px`,
        height: `${cardHeight}px`,
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);

      if (!didMove) {
        // Ignore clicks on links inside the card
        if (e.target instanceof HTMLElement && e.target.tagName === "A") {
          e.target.click();
        } else {
          switchToInput(e);
        }
        return;
      }

      if (stopScroll) stopScroll();

      const index = Array.from(
        placeholderNode.parentNode?.children ?? []
      ).findIndex((e) => e === placeholderNode);
      root.classList.remove(classes.isMovingCard);
      const targetRect = placeholderNode.getBoundingClientRect();

      const x = targetRect.left;
      const y = targetRect.top;

      cardElement.style.transition = `transform ${CARD_ANIMATION_TIME}ms`;
      cardElement.style.transform = `translateX(${x}px) translateY(${y}px)`;

      {
        let timeout: ReturnType<typeof setTimeout>;
        const cleanup = onlyOnceFn(() => {
          cardElement.style.transition = "";
          cardElement.style.transform = "";
          cardElement.style.position = "";
          cardElement.style.width = "";
          cardElement.remove();
          placeholderNode.replaceWith(cardElement);
          cardElement.classList.remove(classes.movingCard);
          clearTimeout(timeout);
        });

        timeout = setTimeout(() => {
          cleanup();
        }, CARD_ANIMATION_TIME);
        cleanupHooks.add(() => {
          cleanup();
        });
      }

      api.moveCard({
        cardId: cardElement.dataset.cardId!,
        target: hoverDeck.dataset.deckId,
        index,
      });

      deckElements.forEach((e) => e.classList.remove(classes.hoverDeck));

      didMove = false;
    };

    const onMouseMove = ({
      clientX,
      clientY,
    }: {
      clientX: number;
      clientY: number;
    }) => {
      prevMoveCoords = { clientX, clientY };

      if (
        !didMove &&
        distanceBetween({ x: clientX, y: clientY }, initialCoords) > 10
      ) {
        onMoveBegin();
        didMove = true;
      }

      if (!didMove) return;

      styleMovedCard({
        clientX,
        clientY,
        cardElement,
        insetX,
        insetY,
      });

      hoverDeck = findClosestDeck(
        deckElements,
        horizontalMiddle(cardElement)
      );

      const didSwap = possiblyPerformHoverSwap({
        hoverDeck,
        clientY,
        insetY,
        cardHeight,
        cardElement,
        placeholderNode,
      });

      if (didSwap) {
        deckElements.forEach((e) =>
          e.classList.remove(classes.hoverDeck)
        );
        hoverDeck.classList.add(classes.hoverDeck);
      }
    };

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
  });

  return cardElement;
}

