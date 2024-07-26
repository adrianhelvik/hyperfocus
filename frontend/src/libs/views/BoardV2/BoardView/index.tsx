import { getDeckColorCSSVariables } from "./getDeckColorCSSVariables";
import createDeckHeaderElement from "./createDeckHeaderElement";
import { makeTextAreaAutoGrow } from "./makeTextAreaAutoGrow";
import { Board, Card, Deck, Portal } from "src/libs/types";
import { ConfirmInPlaceFn } from "src/libs/withConfirm";
import { isKeypressElement } from "./isKeypressElement";
import createCardElement from "./createCardElement";
import { ShowMenuFn } from "src/libs/withMenu";
import { CleanupHooks } from "./CleanupHooks";
import classes from "./styles.module.css";
import api from "src/libs/api";
import { el } from "./el";
import { ShowModalInPlace } from "src/libs/withModal";

export class BoardView {
  private cleanupHooks = new CleanupHooks();
  private deckElements: HTMLElement[] = [];
  private onDestroyCallbacks: Array<() => void> = [];
  private scrollSnapTimeout: ReturnType<typeof setTimeout> | null = null;
  private cancelSnapToDeck: (() => void) | null = null;
  private focusDeckTimeout?: ReturnType<typeof setTimeout>;
  private addedCardIds = new Set<string>();

  constructor(
    private readonly root: HTMLElement,
    private readonly board: Board,
    private readonly showMenu: ShowMenuFn,
    private readonly confirmInPlace: ConfirmInPlaceFn,
    private readonly showModalInPlace: ShowModalInPlace,
  ) {
    this.unmount();
    this.mount();
  }

  mount() {
    this.buildInterface();
    this.possiblyFocusDeck();
    this.addRealtimeListeners();
    document.addEventListener("keydown", this.onKeydown);
  }

  private addRealtimeListeners() {
    SOCKET_IO.on("addCard", this.onAddCard);
  }

  private removeRealtimeListeners() {
    SOCKET_IO.off("addCard", this.onAddCard);
  }

  private onAddCard = (card: Card) => {
    if (card.boardId !== this.board.boardId) return;

    if (this.addedCardIds.has(card.cardId)) {
      return;
    }

    const cardsContainer = this.root.querySelector(`[data-cards-container="${card.deckId}"]`)
    const deckElement = this.deckElements.find(it => it.dataset.deckId === card.deckId);
    if (deckElement && cardsContainer instanceof HTMLElement) {
      cardsContainer.append(createCardElement({
        cleanupHooks: this.cleanupHooks,
        deckElements: this.deckElements,
        deckElement,
        board: this.board,
        card,
        root: this.root,
      }));
    } else {
      console.error("Did not find deck element. Remounting.");
      this.unmount();
      this.mount();
    }
  };

  public unmount() {
    clearTimeout(this.focusDeckTimeout);
    this.onDestroyCallbacks.forEach((fn) => fn());
    this.onDestroyCallbacks = [];
    this.root.innerHTML = "";
    this.root.classList.remove(classes.board);
    document.body.classList.remove(classes.body);
    document.removeEventListener("keydown", this.onKeydown);
    if (this.scrollSnapTimeout) clearTimeout(this.scrollSnapTimeout);
    if (this.cancelSnapToDeck) this.cancelSnapToDeck();
    this.removeRealtimeListeners();
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

  private possiblyFocusDeck() {
    const params = new URLSearchParams(location.search);
    const focusDeckId = params.get("focusDeck");

    if (focusDeckId) {
      const deckElement = this.deckElements.find(it => it.dataset.deckId === focusDeckId)

      if (deckElement) {
        deckElement.scrollIntoView({
          block: "center",
        });

        params.delete("focusDeck");

        const newUrl = new URL(location.href);
        newUrl.search = params.toString();

        history.replaceState({}, "", newUrl.toString());

        deckElement.focus();
      }
    }
  }

  private showSearchUI() {
    // TODO: Implement this
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
      tabIndex: 0,
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
      createDeckHeaderElement({
        root: this.root,
        deckElement,
        child,
        cleanupHooks: this.cleanupHooks,
        deckElements: this.deckElements,
        showMenu: this.showMenu,
        confirmInPlace: this.confirmInPlace,
        showModalInPlace: this.showModalInPlace,
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
        createCardElement({
          cleanupHooks: this.cleanupHooks,
          deckElements: this.deckElements,
          deckElement,
          board: this.board,
          card,
          root: this.root,
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
      className: classes.newCardContainer,
    });

    const addCardInput = el("textarea", {
      dataset: {
        addCardInput: deck.deckId,
      },
      required: true,
      className: classes.newCardInput,
      placeholder: "Add card",
    });

    cleanupHooks.add(makeTextAreaAutoGrow(addCardInput));
    form.append(addCardInput);

    const submit = async () => {
      const title = addCardInput.value;
      addCardInput.value = "";
      const cardId = crypto.randomUUID();
      this.addedCardIds.add(cardId);
      await api.addCard({
        cardId,
        title,
        deckId: deck.deckId,
      });
      const card = {
        title,
        cardId,
        boardId: deck.boardId,
        deckId: deck.deckId,
        images: [],
      };
      const newCardElement = createCardElement({
        root,
        card,
        deckElement,
        cleanupHooks,
        board: this.board,
        deckElements: this.deckElements,
      });
      deckElement
        .querySelector("[data-cards-container]")
        ?.append(newCardElement);
      deckElement.scrollTop = deckElement.scrollHeight - deckElement.clientHeight;
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
}
