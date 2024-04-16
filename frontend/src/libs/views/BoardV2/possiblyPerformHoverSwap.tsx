import { verticalMiddle, findCardAt, debugElement } from "./domUtils";

/**
 * Determine if the placeholder should be moved to the hovered position
 */
export function possiblyPerformHoverSwap({
  hoverDeck,
  clientY,
  insetY,
  cardHeight,
  cardElement,
  placeholderNode,
}: {
  hoverDeck: HTMLElement;
  clientY: number;
  insetY: number;
  cardHeight: number;
  cardElement: HTMLElement;
  placeholderNode: HTMLElement;
}) {
  if (!hoverDeck) return;
  const cardsContainer = hoverDeck.querySelector("[data-cards-container]");
  const {
    bottom: deckBottom,
    left: deckLeft,
    width: deckWidth,
    top: deckTop,
  } = cardsContainer.getBoundingClientRect();
  const deckCenter = (deckLeft + deckWidth / 2) | 0;

  const topY = clientY - insetY;
  const bottomY = clientY - insetY + cardHeight;

  const topEl = findCardAt(deckCenter, topY, cardElement);
  const bottomEl = findCardAt(deckCenter, bottomY, cardElement);

  debugElement(topEl, "green");
  debugElement(bottomEl, "blue");

  if (
    topEl &&
    bottomEl &&
    placeholderNode.parentElement !== topEl.parentElement &&
    bottomEl !== topEl.nextElementSibling
  ) {
    const inBetweenElements: HTMLElement[] = [];
    for (
      let el = topEl.nextElementSibling;
      el && el !== bottomEl;
      el = el.nextElementSibling
    ) {
      debugElement(el as HTMLElement, "orange");
      inBetweenElements.push(el as HTMLElement);
    }
    const middle =
      inBetweenElements[Math.ceil(inBetweenElements.length / 2)] ?? bottomEl;
    placeholderNode.remove();
    middle.parentElement.insertBefore(placeholderNode, middle);
    return true;
  }

  if (topEl && clientY - insetY <= verticalMiddle(topEl)) {
    console.log("A");
    topEl.parentNode.insertBefore(placeholderNode, topEl);
    return true;
  } else if (
    bottomEl &&
    clientY - insetY + cardHeight >= verticalMiddle(bottomEl) &&
    placeholderNode.parentElement === bottomEl.parentElement
  ) {
    console.log("B-1");
    bottomEl.parentNode.insertBefore(placeholderNode, bottomEl.nextSibling);
    return true;
  } else if (
    topEl &&
    bottomEl &&
    clientY - insetY + cardHeight >= verticalMiddle(bottomEl) &&
    placeholderNode.parentElement !== bottomEl.parentElement
  ) {
    // I have no idea why this works, but when debugging
    // it solved a problem I had. This condition can probably
    // be refined. It's also a good first place to search for bugs.
    console.log("B-2");
    topEl.parentNode.insertBefore(placeholderNode, topEl.nextSibling);
  } else if (!bottomEl && clientY - insetY + cardHeight >= deckBottom) {
    console.log("C");
    cardsContainer.append(placeholderNode);
    return true;
  } else if (clientY - insetY < deckTop) {
    console.log("D");
    // Above deck
    cardsContainer.insertBefore(placeholderNode, cardsContainer.children[0]);
    return true;
  }

  return false;
}
