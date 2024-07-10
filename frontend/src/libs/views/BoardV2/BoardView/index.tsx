import { replaceWithInputAndFocusAtCaretPosition } from "./replaceWithInputAndFocusAtCaretPosition";
import { possiblyPerformHoverSwap } from "./possiblyPerformHoverSwap";
import createAutoGrowTextarea from "./createAutoGrowTextarea";
import { isKeypressElement } from "./isKeypressElement";
import Deck, { DeckParam } from "src/libs/store/Deck";
import { findClosestDeck } from "./findClosestDeck";
import { distanceBetween } from "./distanceBetween";
import { setLinkableText } from "./setLinkableText";
import { NavigateFunction } from "react-router-dom";
import { BoardParam } from "src/libs/store/Board";
import { styleMovedCard } from "./styleMovedCard";
import { horizontalMiddle } from "./domUtils";
import { CleanupHooks } from "./CleanupHooks";
import Portal from "src/libs/store/Portal";
import classes from "./styles.module.css";
import Card from "src/libs/store/Card";
import onlyOnceFn from "./onlyOnceFn";
import animate from "./animate";
import api from "src/libs/api";
import Color from "color";

const AUTO_SCROLL_OFFSET = 100;
const CARD_ANIMATION_TIME = 300;
const DECK_ANIMATION_TIME = 300;

export class BoardView {
  private cleanupHooks = new CleanupHooks();
  private deckElements: HTMLElement[] = [];
  private onDestroyCallbacks: Array<() => void> = [];
  private scrollSnapTimeout: ReturnType<typeof setTimeout> | null = null;
  private cancelSnapToDeck: (() => void) | null = null;

  constructor(private root: HTMLElement, private board: BoardParam, private navigate: NavigateFunction) {
    addEventListener("subtask:addDeck", this.onDeckAdded);
    this.cleanup();
    this.buildInterface();
    document.addEventListener("keydown", this.onKeydown);
  }

  onDeckAdded = () => {
    this.cleanup();
    this.buildInterface();
  }

  unmount() {
    this.cleanup();
  }

  private cleanup() {
    removeEventListener("subtask:addDeck", this.onDeckAdded);

    this.onDestroyCallbacks.forEach((fn) => fn());
    this.onDestroyCallbacks = [];
    this.root.innerHTML = "";
    this.root.classList.remove(classes.board);
    document.body.classList.remove(classes.body);
    document.removeEventListener("keydown", this.onKeydown);
    if (this.scrollSnapTimeout) clearTimeout(this.scrollSnapTimeout);
    if (this.cancelSnapToDeck) this.cancelSnapToDeck()
  }

  private onKeydown = (e: KeyboardEvent) => {
    if (e.metaKey && /[1-9]/.test(e.key)) {
      e.preventDefault();
      return this.navigate("/app");
    }

    if (!isKeypressElement(e.target)) {
      if (e.key === "F" && (e.metaKey || e.ctrlKey)) {
        this.showSearchUI();
      }
    }

    if (!isKeypressElement(e.target) || (e.target && 'value' in e.target && !e.target.value)) {
      // TODO: Evaluate whether I should use these modifier keys

      if (e.key === "ArrowRight") {
        const deckIndex = this.deckElements.findIndex(it => document.activeElement == null || it.contains(document.activeElement));
        const sibling = this.deckElements[deckIndex + 1];
        this.focusAddCardInputInDeck(sibling);
      }

      if (e.key === "ArrowLeft") {
        let deckIndex = this.deckElements.findIndex(it => document.activeElement == null || it.contains(document.activeElement));
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
  }

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
      this.root.append(this.createDeckElement(child));
    }
  }

  private createDeckElement(child: Deck | Portal) {
    const deckElement = document.createElement("div");
    this.deckElements.push(deckElement);
    deckElement.className = classes.deck;

    const deck =
      child.type === "deck"
        ? (child as Deck)
        : ((child as Portal).target as Deck);

    deckElement.append(
      this.createDeckTitleNode({
        deckElement,
        child,
        cleanupHooks: this.cleanupHooks,
      })
    );

    let deckColor = deck.color || "#757575";

    const isDark = Color(deckColor).darken(0.2).isDark();
    const isVeryDark = Color(deckColor).lighten(0.2).isDark();

    deckElement.style.setProperty("--deck-color", deckColor);
    if (deck.color) deckElement.style.setProperty("--deck-color-or-unset", deckColor);
    deckElement.style.setProperty(
      "--deck-text-color",
      isDark ? "white" : "black"
    );
    deckElement.style.setProperty(
      "--deck-text-color",
      isDark ? "white" : "black"
    );
    deckElement.style.setProperty(
      "--deck-black-or-white-contrast",
      isVeryDark ? "white" : "black"
    );

    deckElement.dataset.deckId = deck.deckId;

    const cardsContainer = document.createElement("div");
    cardsContainer.dataset.cardsContainer = deck.deckId;
    cardsContainer.className = classes.cardsContainer;
    deckElement.append(cardsContainer);

    for (const card of deck?.cards ?? []) {
      cardsContainer.append(
        this.buildCardForDeck({
          root: this.root,
          card,
          deckElement,
          cleanupHooks: this.cleanupHooks,
        })
      );
    }

    deckElement.append(
      this.createAddCardInput({
        root: this.root,
        deckElement,
        deck,
        cleanupHooks: this.cleanupHooks,
      })
    );

    return deckElement;
  }

  private createDeckTitleNode({
    child,
    deckElement,
    cleanupHooks,
  }: {
    child: Deck | Portal;
    deckElement: HTMLElement;
    cleanupHooks: CleanupHooks;
  }) {
    let initialIndex = -1;

    const containerNode = document.createElement("div");
    containerNode.className = classes.deckTitleContainer;

    const deckTitleNode = document.createElement("h2");
    deckTitleNode.tabIndex = 0;
    deckTitleNode.className = classes.deckTitle;
    setLinkableText(deckTitleNode, child.title);
    containerNode.append(deckTitleNode);

    deckTitleNode.onkeydown = e => {
      if (e.key === "Enter") {
        e.preventDefault();
        startEditingDeckTitle(null);
      }
    };

    const menuNode = document.createElement("button");
    menuNode.type = "button";
    menuNode.className = classes.deckTitleMenu;
    containerNode.append(menuNode);

    menuNode.onclick = () => {
      // TODO: Show menu.
    };

    const iconNode = document.createElement("i");
    iconNode.className = "material-icons";
    iconNode.textContent = "menu";
    menuNode.append(iconNode);

    const titleInput = createAutoGrowTextarea();
    titleInput.className = classes.deckTitleInput;

    const startEditingDeckTitle = (e: { clientX: number, clientY: number } | null) => {
      if (!deckTitleNode.parentNode) return;

      replaceWithInputAndFocusAtCaretPosition({
        sourceElement: deckTitleNode,
        inputElement: titleInput,
        clientX: e ? e.clientX : null,
        clientY: e ? e.clientY : null,
      });
    };

    const commitDeckTitleEdits = () => {
      if (!titleInput.parentNode) return;
      titleInput.parentNode.replaceChild(
        deckTitleNode,
        titleInput,
      );
      child.title = titleInput.value.replace(/\n/g, "");
      titleInput.value = child.title;
      if ('portalId' in child && child.portalId) {
        api.setPortalTitle({
          portalId: child.portalId,
          title: titleInput.value,
        });
      } else if ('deckId' in child && child.deckId) {
        api.setDeckTitle({
          deckId: child.deckId,
          title: titleInput.value,
        });
      }
      setLinkableText(deckTitleNode, titleInput.value);
    };

    titleInput.onblur = () => {
      commitDeckTitleEdits();
    };

    titleInput.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        titleInput.blur();
        deckTitleNode.focus();
      }
    };

    const leftByElement = new Map<HTMLElement, number>();

    let placeholder: HTMLElement;

    let insetX = 0;
    let insetY = 0;

    let x = 0;
    let y = 0;

    const renderFloatingDeck = () => {
      deckElement.style.transform = `translateX(${x}px) translateY(${y}px)`;
    };

    const setPosition = (e: MouseEvent) => {
      x = e.clientX - insetX;
      y = e.clientY - insetY;
    };

    let didMove = false;

    const onMouseMove = (e: MouseEvent) => {
      setPosition(e);
      renderFloatingDeck();

      didMove = true;

      const ownIndex = this.deckElements.indexOf(deckElement);

      const prevElement = placeholder.previousElementSibling as HTMLElement;
      const nextElement = placeholder.nextElementSibling as HTMLElement;

      const prevRect = prevElement?.getBoundingClientRect();
      const nextRect = nextElement?.getBoundingClientRect();

      const x =
        e.clientX - insetX + placeholder.getBoundingClientRect().width / 2;

      if (prevRect && prevRect.left + prevRect.width > x) {
        placeholder.remove();
        prevElement.parentNode?.insertBefore(placeholder, prevElement);
        this.deckElements.splice(ownIndex, 1);
        this.deckElements.splice(ownIndex - 1, 0, deckElement);
      } else if (nextRect && nextRect.left < x) {
        placeholder.remove();
        nextElement.parentNode?.insertBefore(
          placeholder,
          nextElement.nextElementSibling
        );
        this.deckElements.splice(ownIndex, 1);
        this.deckElements.splice(ownIndex + 1, 0, deckElement);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!didMove) {
        if ((e.target instanceof HTMLElement) && e.target.tagName === "A") {
          e.target.click();
        } else {
          deckElement.style.transform = "";
          deckElement.style.position = "";
          placeholder.replaceWith(deckElement);
          startEditingDeckTitle(e);
        }
      } else {
        setPosition(e);
        renderFloatingDeck();

        const placeholderRect = placeholder.getBoundingClientRect();

        const index = this.deckElements.indexOf(deckElement);
        if (initialIndex !== index) {
          api.moveBoardChildToIndex({
            boardId: this.board.boardId,
            index,
            item: child,
          });
        }

        cleanupHooks.add(
          animate({
            onComplete: onlyOnceFn(() => {
              placeholder.replaceWith(deckElement);
              deckElement.style.transform = "";
              deckElement.style.position = "";
            }),
            values: {
              x: [x, placeholderRect.left],
              y: [y, placeholderRect.top],
            },
            time: DECK_ANIMATION_TIME,
            fn: (pos) => {
              x = pos.x;
              y = pos.y;
              renderFloatingDeck();
            },
          })
        );
      }

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    containerNode.onmousedown = (e) => {
      if ((e.target instanceof Node) && menuNode.contains(e.target)) return;

      e.preventDefault();
      cleanupHooks.run();
      didMove = false;

      for (const element of this.deckElements) {
        leftByElement.set(element, element.getBoundingClientRect().left);
      }

      const rect = deckElement.getBoundingClientRect();
      placeholder = document.createElement("div");
      placeholder.className = classes.deckPlaceholder;
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      deckElement.replaceWith(placeholder);
      deckElement.style.position = "fixed";
      deckElement.style.width = `${rect.width}px`;
      deckElement.style.height = `${rect.height}px`;
      deckElement.classList.add(classes.movingDeck);
      document.body.append(deckElement);

      this.deckElements.forEach((e) => {
        if (e !== deckElement) {
          e.style.transition = "transform 300ms";
        }
      });

      cleanupHooks.add(() => {
        this.deckElements.forEach((e) => {
          e.style.transition = "";
          e.style.transform = "";
          e.style.position = "";
          deckElement.classList.remove(classes.movingDeck);
        });
        placeholder.replaceWith(deckElement);
      });

      initialIndex = this.deckElements.indexOf(deckElement);

      insetX = e.clientX - rect.left;
      insetY = e.clientY - rect.top;
      x = e.clientX - insetX;
      y = e.clientY - insetY;

      setPosition(e);
      renderFloatingDeck();

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    return containerNode;
  }

  private createAddCardInput({
    root,
    deckElement,
    deck,
    cleanupHooks,
  }: {
    root: HTMLElement;
    deckElement: HTMLElement;
    deck: DeckParam;
    cleanupHooks: CleanupHooks;
  }) {
    const form = document.createElement("form");
    form.classList.add(classes.newCardContainer);

    const addCardInput = createAutoGrowTextarea();
    addCardInput.dataset.addCardInput = deck.deckId;
    addCardInput.required = true;
    addCardInput.classList.add(classes.newCardInput);
    addCardInput.placeholder = "Add card";
    form.append(addCardInput);

    const submit = async () => {
      const title = addCardInput.value;
      addCardInput.value = "";
      const { cardId } = await api.addCard({
        title,
        deckId: deck.deckId!,
      });
      const card = {
        title,
        cardId,
        images: [],
        setTitle() { },
      };
      deckElement.querySelector("[data-cards-container]")?.append(
        this.buildCardForDeck({
          root,
          card,
          deckElement,
          cleanupHooks,
        })
      );
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
    if (!sibling) return
    const addCardInput = sibling.querySelector("[data-add-card-input]");
    if (addCardInput instanceof HTMLElement) {
      addCardInput.focus();
      addCardInput.scrollIntoView({
        block: "nearest",
        inline: "center",
      });
    }
  }

  private buildCardForDeck({
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

    cardInputElement.onmousedown = e => {
      e.stopPropagation();
    };

    const switchToInput = (e: MouseEvent | null) => {
      if (e) editSource = "mouse"
      else editSource = "keyboard";
      cardElement.dataset.editSource = editSource;

      replaceWithInputAndFocusAtCaretPosition({
        sourceElement: cardContentElement,
        inputElement: cardInputElement,
        clientX: e ? e.clientX : null,
        clientY: e ? e.clientY : null,
      });
    };

    cardInputElement.onkeydown = e => {
      if (e.key === "Enter" && !e.shiftKey) {
        cardInputElement.value = cardInputElement.value.trim()
        e.preventDefault()
        cardInputElement.blur();
      }
    };

    cardInputElement.onblur = () => {
      setLinkableText(cardContentElement, cardInputElement.value);
      cardInputElement.replaceWith(cardContentElement);
      if (cardInputElement.value === "") {
        cardElement.remove();
        api.deleteCard({
          cardId: card.cardId!,
        });
        this.board.children.find(it => {
          if ("deckId" in it && it.deckId === deckElement.dataset.deckId) {
            const index = it.cards.findIndex(it => it.cardId === card.cardId);

            if (index !== -1) {
              it.cards.splice(index, 1);
            }
          }
          // TODO: Handle removing empty cards from portals
        });
      } else {
        api.setCardTitle({
          cardId: card.cardId!,
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

    cardContentElement.onkeydown = e => {
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

      let scrollInterval: ReturnType<typeof setInterval>;

      const {
        top,
        left,
        width,
        height: cardHeight,
      } = cardElement.getBoundingClientRect();

      const insetX = event.clientX - left;
      const insetY = event.clientY - top;

      let scrollDirection: "NONE" | "LEFT" | "RIGHT" = "NONE";

      const onMoveBegin = () => {
        didMove = true;

        cleanupHooks.run();

        root.classList.add(classes.isMovingCard);
        cardElement.parentElement?.parentElement?.classList.add(classes.hoverDeck);

        scrollInterval = setInterval(() => {
          if (scrollDirection === "LEFT") {
            this.root.scrollBy({ left: -3 });
            if (prevMoveCoords) onMouseMove(prevMoveCoords);
          }
          if (scrollDirection === "RIGHT") {
            this.root.scrollBy({ left: 2 });
            if (prevMoveCoords) onMouseMove(prevMoveCoords);
          }
        });

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
          if ((e.target instanceof HTMLElement) && e.target.tagName === "A") {
            e.target.click();
          } else {
            switchToInput(e);
          }
          return;
        }

        clearInterval(scrollInterval);

        const index = Array.from(placeholderNode.parentNode?.children ?? []).findIndex(
          (e) => e === placeholderNode
        );
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

        if (!didMove && distanceBetween({ x: clientX, y: clientY }, initialCoords) > 10) {
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

        if (clientX < AUTO_SCROLL_OFFSET) scrollDirection = "LEFT";
        else if (clientX >= window.innerWidth - AUTO_SCROLL_OFFSET)
          scrollDirection = "RIGHT";
        else scrollDirection = "NONE";
      };

      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);
    });

    return cardElement;
  }
}
