import { middleOfElement, findCardAt } from "./domUtils";

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
    const {
        bottom: deckBottom,
        left: deckLeft,
        width: deckWidth,
    } = hoverDeck.getBoundingClientRect();
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
        clientY - insetY <= middleOfElement(cardElementUnderTopEdge)
    ) {
        cardElementUnderTopEdge.parentNode.insertBefore(
            placeholderNode,
            cardElementUnderTopEdge
        );
    } else if (
        cardElementUnderBottomEdge &&
        clientY - insetY + cardHeight >=
            middleOfElement(cardElementUnderBottomEdge)
    ) {
        cardElementUnderBottomEdge.parentNode.insertBefore(
            placeholderNode,
            cardElementUnderBottomEdge
        );
    } else if (
        !cardElementUnderBottomEdge &&
        clientY - insetY + cardHeight >= deckBottom
    ) {
        hoverDeck.append(placeholderNode);
    }
}
