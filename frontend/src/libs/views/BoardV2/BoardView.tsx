import { possiblyPerformHoverSwap } from "./possiblyPerformHoverSwap";
import Deck, { DeckParam } from "src/libs/store/Deck";
import { BoardParam } from "src/libs/store/Board";
import { styleMovedCard } from "./styleMovedCard";
import { horizontalMiddle } from "./domUtils";
import { CleanupHooks } from "./CleanupHooks";
import Portal from "src/libs/store/Portal";
import classes from "./styles.module.css";
import Card from "src/libs/store/Card";
import animate from "./animate";
import api from "src/libs/api";
import Color from "color";
import onlyOnceFn from "./onlyOnceFn";
import createAutoGrowTextarea from "./createAutoGrowTextarea";
import { findClosestDeck } from "./findClosestDeck";
import getCaretPositionAndNodeFromPoint from "./getCaretPositionAndNodeFromPoint";
import { distanceBetween } from "./distanceBetween";

const AUTO_SCROLL_OFFSET = 100;
const CARD_ANIMATION_TIME = 300;
const DECK_ANIMATION_TIME = 300;

export class BoardView {
  private cleanupHooks = new CleanupHooks();
  private deckElements: HTMLElement[] = [];
  private onDestroyCallbacks: Array<() => void> = [];

  constructor(private root: HTMLElement, private board: BoardParam) {
    addEventListener("subtask:addDeck", this.onDeckAdded);
    this.cleanup();
    this.buildInterface();
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

    deckElement.style.setProperty("--deck-color", deckColor);
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
      isDark ? "black" : "white"
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
      this.createInsertField({
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
    const containerNode = document.createElement("div");
    containerNode.className = classes.deckTitleContainer;

    const deckTitleNode = document.createElement("h2");
    deckTitleNode.className = classes.deckTitle;
    deckTitleNode.textContent = child.title;
    containerNode.append(deckTitleNode);

    const menuNode = document.createElement("button");
    menuNode.type = "button";
    menuNode.className = classes.deckTitleMenu;
    containerNode.append(menuNode);

    menuNode.onclick = () => {
      console.log({ ...child });
    };

    const iconNode = document.createElement("i");
    iconNode.className = "material-icons";
    iconNode.textContent = "menu";
    menuNode.append(iconNode);

    const titleInput = document.createElement("input");
    titleInput.className = classes.deckTitleInput;

    const startEditingDeckTitle = () => {
      if (!deckTitleNode.parentNode) return;
      titleInput.value = deckTitleNode.textContent;
      deckTitleNode.parentNode.replaceChild(
        titleInput,
        deckTitleNode,
      );
      titleInput.focus();
    };

    const commitDeckTitleEdits = () => {
      if (!titleInput.parentNode) return;
      titleInput.parentNode.replaceChild(
        deckTitleNode,
        titleInput,
      );
      child.title = titleInput.value;
      if ('portalId' in child) {
        api.setPortalTitle({
          portalId: child.portalId,
          title: titleInput.value,
        });
      } else {
        api.setDeckTitle({
          deckId: child.deckId,
          title: titleInput.value,
        });
      }
      deckTitleNode.textContent = titleInput.value;
    };

    titleInput.onblur = () => {
      commitDeckTitleEdits();
    };

    titleInput.onkeydown = (e) => {
      if (e.key === "Enter") {
        titleInput.blur();
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
        prevElement.parentNode.insertBefore(placeholder, prevElement);
        this.deckElements.splice(ownIndex, 1);
        this.deckElements.splice(ownIndex - 1, 0, deckElement);
      } else if (nextRect && nextRect.left < x) {
        placeholder.remove();
        nextElement.parentNode.insertBefore(
          placeholder,
          nextElement.nextElementSibling
        );
        this.deckElements.splice(ownIndex, 1);
        this.deckElements.splice(ownIndex + 1, 0, deckElement);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!didMove) {
        deckElement.style.transform = null;
        deckElement.style.position = null;
        placeholder.replaceWith(deckElement);
        startEditingDeckTitle();
      } else {
        setPosition(e);
        renderFloatingDeck();

        const placeholderRect = placeholder.getBoundingClientRect();

        api.moveBoardChildToIndex({
          boardId: this.board.boardId,
          index: this.deckElements.indexOf(deckElement),
          item: child,
        });

        cleanupHooks.add(
          animate({
            onComplete: onlyOnceFn(() => {
              placeholder.replaceWith(deckElement);
              deckElement.style.transform = null;
              deckElement.style.position = null;
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
          e.style.transition = null;
          e.style.transform = null;
          e.style.position = null;
          deckElement.classList.remove(classes.movingDeck);
        });
        placeholder.replaceWith(deckElement);
      });

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

  private createInsertField({
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

    const input = createAutoGrowTextarea();
    input.required = true;
    input.classList.add(classes.newCardInput);
    input.placeholder = "Add card";
    form.append(input);

    const submit = async () => {
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
      deckElement.querySelector("[data-cards-container]").append(
        this.buildCardForDeck({
          root,
          card,
          deckElement,
          cleanupHooks,
        })
      );
      input.focus();
    };

    input.addEventListener("keydown", (e) => {
      if (e.which === 13 && !e.shiftKey) {
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
    };

    return form;
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
    const cardElement = document.createElement("div");

    cardElement.dataset.cardId = card.cardId;
    cardElement.className = classes.card;

    const inputElement = document.createElement("textarea");
    inputElement.className = classes.cardInput;

    inputElement.onmousedown = e => {
      e.stopPropagation();
    };

    const switchToInput = (e: MouseEvent) => {
      const result = getCaretPositionAndNodeFromPoint(e.clientX, e.clientY);
      inputElement.value = cardElement.textContent;
      cardContentElement.replaceWith(inputElement);
      inputElement.focus();
      if (result != null) {
        inputElement.selectionStart = result.offset;
        inputElement.selectionEnd = result.offset;
      }
    };

    inputElement.onkeydown = e => {
      if (e.key === "Enter" && !e.shiftKey) {
        inputElement.value = inputElement.value.trim()
        e.preventDefault()
        inputElement.blur();
      }
    };

    inputElement.onblur = () => {
      cardContentElement.textContent = inputElement.value;
      inputElement.replaceWith(cardContentElement);
      api.setCardTitle({
        cardId: card.cardId,
        title: inputElement.value,
      });
    };

    const cardContentElement = document.createElement("div");
    cardContentElement.className = classes.cardContent;
    cardContentElement.textContent = card.title;
    cardElement.append(cardContentElement);

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
        cardElement.parentElement.parentElement.classList.add(classes.hoverDeck);

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
          switchToInput(e);
          return;
        }

        clearInterval(scrollInterval);

        const index = Array.from(placeholderNode.parentNode.children).findIndex(
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
            cardElement.style.transition = null;
            cardElement.style.transform = null;
            cardElement.style.position = null;
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
          cardId: cardElement.dataset.cardId,
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
        else if (clientX >= screen.width - AUTO_SCROLL_OFFSET)
          scrollDirection = "RIGHT";
        else scrollDirection = "NONE";
      };

      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("mousemove", onMouseMove);
    });

    return cardElement;
  }
}
