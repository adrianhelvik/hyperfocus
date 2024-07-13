import { replaceWithInputAndFocusAtCaretPosition } from "./replaceWithInputAndFocusAtCaretPosition";
import { getDeckColorCSSVariables } from "./getDeckColorCSSVariables";
import { possiblyPerformHoverSwap } from "./possiblyPerformHoverSwap";
import startScrollWhenNearEdges from "./startScrollWhenNearEdges";
import { makeTextAreaAutoGrow } from "./makeTextAreaAutoGrow";
import createAutoGrowTextarea from "./createAutoGrowTextarea";
import { Board, Card, Deck, Portal } from "src/libs/types";
import createDeckTitleNode from "./createDeckTitleNode";
import { isKeypressElement } from "./isKeypressElement";
import { findClosestDeck } from "./findClosestDeck";
import { distanceBetween } from "./distanceBetween";
import { setLinkableText } from "./setLinkableText";
import { styleMovedCard } from "./styleMovedCard";
import { horizontalMiddle } from "./domUtils";
import { CleanupHooks } from "./CleanupHooks";
import classes from "./styles.module.css";
import onlyOnceFn from "./onlyOnceFn";
import api from "src/libs/api";
import { el } from "./el";

const CARD_ANIMATION_TIME = 300;

export class BoardView {
  private cleanupHooks = new CleanupHooks();
  private deckElements: HTMLElement[] = [];
  private onDestroyCallbacks: Array<() => void> = [];
  private scrollSnapTimeout: ReturnType<typeof setTimeout> | null = null;
  private cancelSnapToDeck: (() => void) | null = null;

  constructor(private root: HTMLElement, private readonly board: Board) {
    this.cleanup();
    this.buildInterface();
    document.addEventListener("keydown", this.onKeydown);
  }

  unmount() {
    this.cleanup();
  }

  private cleanup() {
    this.onDestroyCallbacks.forEach((fn) => fn());
    this.onDestroyCallbacks = [];
    this.root.innerHTML = "";
    this.root.classList.remove(classes.board);
    document.body.classList.remove(classes.body);
    document.removeEventListener("keydown", this.onKeydown);
    if (this.scrollSnapTimeout) clearTimeout(this.scrollSnapTimeout);
    if (this.cancelSnapToDeck) this.cancelSnapToDeck();
  }

  private onKeydown = (e: KeyboardEvent) => {
    if (!isKeypressElement(e.target)) {
      if (e.key === "F" && (e.metaKey || e.ctrlKey)) {
        this.showSearchUI();
      }
    }

    if (
      !isKeypressElement(e.target) ||
      (e.target && "value" in e.target && !e.target.value)
    ) {
      if (e.metaKey || e.ctrlKey) return;

      if (e.key === "ArrowRight") {
        const deckIndex = this.deckElements.findIndex(
          (it) =>
            document.activeElement == null ||
            it.contains(document.activeElement)
        );
        const sibling = this.deckElements[deckIndex + 1];
        this.focusAddCardInputInDeck(sibling);
      }

      if (e.key === "ArrowLeft") {
        let deckIndex = this.deckElements.findIndex(
          (it) =>
            document.activeElement == null ||
            it.contains(document.activeElement)
        );
        if (deckIndex === -1) deckIndex = this.deckElements.length - 1;
        const sibling = this.deckElements[deckIndex - 1];
        this.focusAddCardInputInDeck(sibling);
      }

      if (e.key === "ArrowUp") {
        // TODO
      }

      if (e.key === "ArrowDown") {
        // TODO
      }
    }
  };

  private showSearchUI() {
    // TODO: Implement this
  }

  addEventListener<
    Handler extends Function,
    EventName extends string,
    Target extends {
      addEventListener(n: EventName, e: Handler): void;
      removeEventListener(n: EventName, e: Handler): void;
    }
  >(target: Target, event: EventName, handler: Handler) {
    target.addEventListener(event, handler);
    return () => {
      target.removeEventListener(event, handler);
    };
  }

  private buildInterface() {
    this.deckElements = [];
    this.root.classList.add(classes.board);
    document.body.classList.add(classes.body);

    for (const child of this.board.children) {
      const element = this.createDeckElement(child);
      this.appendDeckElement(element);
    }
  }

  onDeckAdded(deck: Deck) {
    const element = this.createDeckElement(deck);
    this.appendDeckElement(element);
    element.scrollIntoView({
      behavior: "smooth",
      inline: "center",
    });
  }

  private appendDeckElement(element: HTMLDivElement) {
    this.root.append(element);
    this.deckElements.push(element);
  }

  private createDeckElement(child: Deck | Portal) {
    const deck = child.type === "deck" ? child : child.target;

    const deckElement = el("div", {
      className: classes.deck,
      dataset: {
        deckId: deck.deckId,
        childType: child.type,
      },
      style: getDeckColorCSSVariables(child),
    });

    const deckContentElement = el("div", {
      className: classes.deckContent,
    });
    deckElement.append(deckContentElement);

    deckContentElement.append(
      createDeckTitleNode({
        root: this.root,
        deckElement,
        child,
        cleanupHooks: this.cleanupHooks,
        deckElements: this.deckElements,
      })
    );

    const cardsContainer = el("div", {
      dataset: {
        cardsContainer: deck.deckId,
      },
      className: classes.cardsContainer,
    });
    deckContentElement.append(cardsContainer);

    for (const card of deck?.cards ?? []) {
      cardsContainer.append(
        this.createCardElement({
          root: this.root,
          card,
          deckElement,
          cleanupHooks: this.cleanupHooks,
        })
      );
    }

    deckContentElement.append(
      this.createAddCardInput({
        root: this.root,
        deckElement,
        deck,
        cleanupHooks: this.cleanupHooks,
      })
    );

    return deckElement;
  }

  private createAddCardInput({
    root,
    deckElement,
    deck,
    cleanupHooks,
  }: {
    root: HTMLElement;
    deckElement: HTMLElement;
    deck: Deck;
    cleanupHooks: CleanupHooks;
  }) {
    const form = el("form", {
      className: classes.newCardContainer
    });

    const addCardInput = el("textarea", {
      dataset: {
        addCardInput: deck.deckId,
      },
      required: true,
      className: classes.newCardInput,
      placeholder: "Add card",
    });

    cleanupHooks.add(makeTextAreaAutoGrow(addCardInput))
    form.append(addCardInput);

    const submit = async () => {
      const title = addCardInput.value;
      addCardInput.value = "";
      const { cardId } = await api.addCard({
        title,
        deckId: deck.deckId,
      });
      const card = {
        title,
        cardId,
        images: [],
      };
      const newCardElement = this.createCardElement({
        root,
        card,
        deckElement,
        cleanupHooks,
      });
      deckElement
        .querySelector("[data-cards-container]")
        ?.append(newCardElement);
      newCardElement.scrollIntoView({
        behavior: "smooth",
      });
    };

    addCardInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    });

    const button = document.createElement("button");
    button.classList.add(classes.newCardButton);
    button.textContent = "Add";
    form.append(button);

    form.onsubmit = async (e: SubmitEvent) => {
      e.preventDefault();
      submit();
      addCardInput.focus();
    };

    return form;
  }

  private focusAddCardInputInDeck(sibling: HTMLElement | null) {
    if (!sibling) return;
    const addCardInput = sibling.querySelector("[data-add-card-input]");
    if (addCardInput instanceof HTMLElement) {
      addCardInput.focus();
      addCardInput.scrollIntoView({
        block: "nearest",
        inline: "center",
      });
    }
  }

  private createCardElement({
    root,
    card,
    deckElement,
    cleanupHooks,
  }: {
    root: HTMLElement;
    card: Card;
    deckElement: HTMLElement;
    cleanupHooks: CleanupHooks;
  }) {
    let editSource: "keyboard" | "mouse" = "mouse";

    const cardElement = document.createElement("div");
    cardElement.dataset.cardId = card.cardId ?? undefined;
    cardElement.className = classes.card;

    const cardInputElement = createAutoGrowTextarea();
    cardInputElement.className = classes.cardInput;

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
        this.board.children.find((it) => {
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

        stopScroll = startScrollWhenNearEdges(this.root);

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

        this.deckElements.forEach((e) => e.classList.remove(classes.hoverDeck));

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
          this.deckElements,
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
          this.deckElements.forEach((e) =>
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
}
