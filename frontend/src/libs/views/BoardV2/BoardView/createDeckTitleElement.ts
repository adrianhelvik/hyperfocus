import { replaceWithInputAndFocusAtCaretPosition } from "./replaceWithInputAndFocusAtCaretPosition";
import { makeTextAreaAutoGrow } from "./makeTextAreaAutoGrow";
import { smoothScrollToCenter } from "./smoothScrollToCenter";
import { setLinkableText } from "./setLinkableText";
import addDragHandlers from "./addDragHandlers";
import { CleanupHooks } from "./CleanupHooks";
import { Deck, Portal } from "src/libs/types";
import classes from "./styles.module.css";
import onlyOnceFn from "./onlyOnceFn";
import animate from "./animate";
import api from "src/libs/api";
import { el } from "./el";

const DECK_ANIMATION_TIME = 300;

export default function createDeckTitleElement({
  root,
  cleanupHooks,
  deckElements,
  deckElement,
  child,
}: {
  root: HTMLElement;
  deckElements: HTMLElement[];
  cleanupHooks: CleanupHooks;
  deckElement: HTMLElement;
  child: Deck | Portal;
}) {
  let initialIndex = -1;

  let deckTitleNode: HTMLHeadingElement;
  let menuNode: HTMLButtonElement;
  let portalDeckNameNode: HTMLDivElement;

  // @prettier-ignore
  const containerNode = el("div", { className: classes.deckTitleContainer },
    el("div", { className: classes.deckTitleContentContainer },
      deckTitleNode = el("h2", {
        tabIndex: 0,
        className: classes.deckTitle,
        onkeydown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            startEditingDeckTitle(null);
          }
        },
      },
        child.title
      ),
      el("div", {},
        portalDeckNameNode = el("div", { className: classes.portalReference }),
      ),
      menuNode = el("button", {
        type: "button",
        className: classes.deckTitleMenu,
        onclick: () => {
          // TODO: Show menu.
        },
      },
        el("i", {
          className: "material-icons",
          textContent: "menu",
        })
      ),
    ),
  );

  if (child.type === "portal") {
    portalDeckNameNode.append(
      el("div", { className: classes.portalReferenceContent },
        el("a", {
          className: classes.portalBoardLink,
          href: `/board/${child.target.boardId}?focusDeck=${child.target.deckId}`,
        },
          el("span", { className: `${classes.portalIcon} material-symbols-outlined` }, "sync_alt"),
          el("span", { className: classes.portalBoardTitle }, child.target.boardTitle),
          "›",
          el("span", { className: classes.portalDeckTitle }, child.target.title),
        ),
      ),
    );
  } else {
    portalDeckNameNode.remove();
  }

  const titleInput = el("textarea", {
    className: classes.deckTitleInput,
    onblur: () => {
      commitDeckTitleEdits();
    },
    onkeydown: (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        titleInput.blur();
        deckTitleNode.focus();
      }
    },
  });

  // TODO: Handle cleanup from autogrow textarea
  makeTextAreaAutoGrow(titleInput);

  let placeholder: HTMLElement;

  let insetX = 0;
  let insetY = 0;

  let x = 0;
  let y = 0;

  const renderFloatingDeck = () => {
    deckElement.style.transform = `translateX(${x}px) translateY(${y}px)`;
  };

  const setPosition = (clientX: number, clientY: number) => {
    x = clientX - insetX;
    y = clientY - insetY;
  };

  addDragHandlers({
    element: containerNode,
    scrollContainer: root,
    shouldIgnoreStart(target) {
      return target instanceof Node && menuNode.contains(target);
    },
    onClick: (clientX, clientY) => {
      startEditingDeckTitle({ clientX, clientY });
    },
    onDragStart,
    onDragMove,
    onDragEnd,
  });

  return containerNode;

  function onDragStart(clientX: number, clientY: number) {
    cleanupHooks.run();

    root.classList.add(classes.isMovingDeck);

    const rect = deckElement.getBoundingClientRect();
    placeholder = el("div", {
      className: classes.deckPlaceholder,
      style: {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      },
    });

    deckElement.replaceWith(placeholder);
    deckElement.style.position = "fixed";
    deckElement.style.width = `${rect.width}px`;
    deckElement.style.height = `${rect.height}px`;
    deckElement.classList.add(classes.movingDeck);

    document.body.append(deckElement);

    deckElements.forEach((e) => {
      if (e !== deckElement) {
        e.style.transition = "transform 300ms";
      }
    });

    cleanupHooks.add(() => {
      deckElements.forEach((e) => {
        e.style.removeProperty("transition");
        e.style.removeProperty("transform");
        e.style.removeProperty("position");
        deckElement.classList.remove(classes.movingDeck);
      });
      placeholder.replaceWith(deckElement);
    });

    initialIndex = deckElements.indexOf(deckElement);

    insetX = clientX - rect.left;
    insetY = clientY - rect.top;
    x = clientX - insetX;
    y = clientY - insetY;

    setPosition(clientX, clientY);
    renderFloatingDeck();
  }

  function onDragMove(clientX: number, clientY: number) {
    setPosition(clientX, clientY);
    renderFloatingDeck();

    const ownIndex = deckElements.indexOf(deckElement);

    const prevElement = placeholder.previousElementSibling as HTMLElement;
    const nextElement = placeholder.nextElementSibling as HTMLElement;

    const prevRect = prevElement?.getBoundingClientRect();
    const nextRect = nextElement?.getBoundingClientRect();

    const x = clientX - insetX + placeholder.getBoundingClientRect().width / 2;

    if (prevRect && prevRect.left + prevRect.width > x) {
      placeholder.remove();
      prevElement.parentNode?.insertBefore(placeholder, prevElement);
      deckElements.splice(ownIndex, 1);
      deckElements.splice(ownIndex - 1, 0, deckElement);
    } else if (nextRect && nextRect.left < x) {
      placeholder.remove();
      nextElement.parentNode?.insertBefore(
        placeholder,
        nextElement.nextElementSibling
      );
      deckElements.splice(ownIndex, 1);
      deckElements.splice(ownIndex + 1, 0, deckElement);
    }
  }

  function onDragEnd(clientX: number, clientY: number) {
    smoothScrollToCenter({
      scrollContainer: root,
      element: placeholder,
      time: DECK_ANIMATION_TIME,
    });
    setPosition(clientX, clientY);
    renderFloatingDeck();

    const placeholderRect = placeholder.getBoundingClientRect();

    const index = deckElements.indexOf(deckElement);
    if (initialIndex !== index) {
      api.moveBoardChildToIndex({
        boardId: child.boardId,
        index,
        item: child,
      });
    }

    const initialScrollLeft = root.scrollLeft;

    cleanupHooks.add(
      animate({
        onComplete: onlyOnceFn(() => {
          placeholder.replaceWith(deckElement);
          deckElement.style.removeProperty("transform");
          deckElement.style.removeProperty("position");
          deckElement.style.removeProperty("width");
          deckElement.style.removeProperty("height");
          root.classList.remove(classes.isMovingDeck);
        }),
        values: {
          x: [x, placeholderRect.left],
          y: [y, placeholderRect.top],
        },
        time: DECK_ANIMATION_TIME,
        fn: (pos) => {
          const scrollXDelta = initialScrollLeft - root.scrollLeft;
          x = pos.x + scrollXDelta;
          y = pos.y;
          renderFloatingDeck();
        },
      })
    );
  }

  function startEditingDeckTitle(
    e: { clientX: number; clientY: number } | null
  ) {
    if (!deckTitleNode.parentNode) return;

    replaceWithInputAndFocusAtCaretPosition({
      sourceElement: deckTitleNode,
      inputElement: titleInput,
      clientX: e ? e.clientX : null,
      clientY: e ? e.clientY : null,
    });
  }

  function commitDeckTitleEdits() {
    if (!titleInput.parentNode) return;
    titleInput.parentNode.replaceChild(deckTitleNode, titleInput);
    child.title = titleInput.value.replace(/\n/g, "");
    titleInput.value = child.title;
    if ("portalId" in child && child.portalId) {
      api.setPortalTitle({
        portalId: child.portalId,
        title: titleInput.value,
      });
    } else if ("deckId" in child && child.deckId) {
      api.setDeckTitle({
        deckId: child.deckId,
        title: titleInput.value,
      });
    }
    setLinkableText(deckTitleNode, titleInput.value);
  }
}
