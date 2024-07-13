import { replaceWithInputAndFocusAtCaretPosition } from "./replaceWithInputAndFocusAtCaretPosition";
import { possiblyPerformHoverSwap } from "./possiblyPerformHoverSwap";
import { makeTextAreaAutoGrow } from "./makeTextAreaAutoGrow";
import { findClosestDeck } from "./findClosestDeck";
import { setLinkableText } from "./setLinkableText";
import { styleMovedCard } from "./styleMovedCard";
import addDragHandlers from "./addDragHandlers";
import { CleanupHooks } from "./CleanupHooks";
import { horizontalMiddle } from "./domUtils";
import { Board, Card } from "src/libs/types";
import classes from "./styles.module.css";
import animate from "./animate";
import api from "src/libs/api";
import { el } from "./el";
import { smoothScrollToCenter } from "./smoothScrollToCenter";

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

  const cardElement = el("div", {
    className: classes.card,
    dataset: {
      cardId: card.cardId ?? undefined,
    },
  });

  const cardInputElement = el("textarea", {
    className: classes.cardInput,
    onmousedown: (e) => {
      e.stopPropagation();
    },
  });

  // XXX: When a card is deleted, this cleanup function
  //      should preferrably be called as well.
  //
  // const cleanupAutoGrow =
  makeTextAreaAutoGrow(cardInputElement);

  const switchToInput = (e: { clientX: number, clientY: number } | null) => {
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

  const cardContentElement = el("div", {
    className: classes.cardContent,
    tabIndex: 0,
    onfocus() {
      editSource = "keyboard";
      cardElement.dataset.editSource = editSource;
    },
    onkeydown(e) {
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
    },
  });
  setLinkableText(cardContentElement, card.title);
  cardElement.append(cardContentElement);

  const placeholderNode = el("div", {
    className: classes.cardPlaceholder,
  });
  let hoverDeck: HTMLElement = deckElement;

  // XXX: These drag handlers should probably be removed
  //      when the card is unmounted. The cleanup hooks
  //      here are triggered when the card is moved as well.
  //      I should clean that up, pun intended.
  //
  // const removeDragHandlers =
  addDragHandlers({
    element: cardElement,
    scrollContainer: root,
    shouldIgnoreStart() {
      return false;
    },
    onClick(clientX, clientY, target) {
      // Ignore clicks on links inside the card
      if (target instanceof HTMLAnchorElement) {
        target.click();
      } else {
        switchToInput({ clientX, clientY });
      }
    },
    onDragStart,
    onDragMove,
    onDragEnd,
  });

  return cardElement;

  function onDragStart(clientX: number, clientY: number) {
    root.style.scrollSnapType = "none";

    const {
      top,
      left,
      width,
      height: cardHeight,
    } = cardElement.getBoundingClientRect();

    const insetX = clientX - left;
    const insetY = clientY - top;

    cleanupHooks.run();

    root.classList.add(classes.isMovingCard);
    cardElement.parentElement?.parentElement?.classList.add(
      classes.hoverDeck
    );

    cardElement.replaceWith(placeholderNode);
    document.body.appendChild(cardElement);
    cardElement.classList.add(classes.movingCard);

    styleMovedCard({
      clientX: clientX,
      clientY: clientY,
      cardElement,
      insetX,
      insetY,
    });

    cardElement.style.width = `${width}px`;

    Object.assign(placeholderNode.style, {
      width: `${width}px`,
      height: `${cardHeight}px`,
    });

    return {
      insetX,
      insetY,
      cardHeight,
    };
  }

  function onDragEnd(clientX: number, clientY: number, context: { insetX: number, insetY: number }) {
    cleanupHooks.run();

    const index = Array.from(
      placeholderNode.parentNode?.children ?? []
    ).findIndex((e) => e === placeholderNode);

    root.classList.remove(classes.isMovingCard);

    smoothScrollToCenter({
      scrollContainer: root,
      element: placeholderNode,
      time: CARD_ANIMATION_TIME,
    });

    const targetRect = placeholderNode.getBoundingClientRect();
    const targetX = targetRect.left;
    const targetY = targetRect.top;

    const initialScrollLeft = root.scrollLeft;

    cleanupHooks.add(animate({
      values: {
        x: [clientX - context.insetX, targetX],
        y: [clientY - context.insetY, targetY],
      },
      fn(pos) {
        const scrollXDelta = initialScrollLeft - root.scrollLeft;
        const x = pos.x + scrollXDelta;
        const y = pos.y;
        cardElement.style.transform = `translateX(${x}px) translateY(${y}px)`;
      },
      time: CARD_ANIMATION_TIME,
      onComplete() {
        cardElement.style.transform = "";
        cardElement.style.position = "";
        cardElement.style.width = "";
        root.style.scrollSnapType = "";
        cardElement.remove();
        placeholderNode.replaceWith(cardElement);
        cardElement.classList.remove(classes.movingCard);
      },
    }));

    deckElements.forEach((e) => e.classList.remove(classes.hoverDeck));

    api.moveCard({
      cardId: cardElement.dataset.cardId!,
      target: hoverDeck.dataset.deckId,
      index,
    });

  };

  function onDragMove(clientX: number, clientY: number, context: { insetX: number, insetY: number, cardHeight: number }) {
    styleMovedCard({
      clientX,
      clientY,
      cardElement,
      insetX: context.insetX,
      insetY: context.insetY,
    });

    hoverDeck = findClosestDeck(
      deckElements,
      horizontalMiddle(cardElement)
    );

    const didSwap = possiblyPerformHoverSwap({
      hoverDeck,
      clientY,
      insetY: context.insetY,
      cardHeight: context.cardHeight,
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
}

