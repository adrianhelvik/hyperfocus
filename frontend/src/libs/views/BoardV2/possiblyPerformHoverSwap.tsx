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
        hoverDeck.append(placeholderNode);
        return true;
    }

    return false;
}
