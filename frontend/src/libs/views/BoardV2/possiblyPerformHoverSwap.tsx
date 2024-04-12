import { verticalMiddle, findCardAt } from "./domUtils";

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
    const cardsContainer = hoverDeck.querySelector("[data-cards-container]")
    const {
        bottom: deckBottom,
        left: deckLeft,
        width: deckWidth,
        top: deckTop,
    } = cardsContainer.getBoundingClientRect();
    const deckCenter = (deckLeft + deckWidth / 2) | 0;

    const topY = clientY - insetY;
    const bottomY = clientY - insetY + cardHeight;

    const cardElementUnderTopEdge = findCardAt(deckCenter, topY, cardElement);
    const cardElementUnderBottomEdge = findCardAt(
        deckCenter,
        bottomY,
        cardElement
    );

    if (
        cardElementUnderTopEdge &&
        clientY - insetY <= verticalMiddle(cardElementUnderTopEdge)
    ) {
        cardElementUnderTopEdge.parentNode.insertBefore(
            placeholderNode,
            cardElementUnderTopEdge
        );
        return true;
    } else if (
        cardElementUnderBottomEdge &&
        clientY - insetY + cardHeight >=
        verticalMiddle(cardElementUnderBottomEdge)
    ) {
        cardElementUnderBottomEdge.parentNode.insertBefore(
            placeholderNode,
            cardElementUnderBottomEdge.nextSibling
        );
        return true;
    } else if (
        !cardElementUnderBottomEdge &&
        clientY - insetY + cardHeight >= deckBottom
    ) {
        cardsContainer.append(placeholderNode);
        return true;
    } else if (clientY - insetY < deckTop) {
        // Above deck
        cardsContainer.insertBefore(placeholderNode, cardsContainer.children[0]);
        return true;
    }

    return false;
}
