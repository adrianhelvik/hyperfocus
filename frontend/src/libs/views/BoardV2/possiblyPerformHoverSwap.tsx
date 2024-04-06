import { middleOfElement } from "./domUtils";
import { findCardAt } from "./createBoardView";

export function possiblyPerformHoverSwap({
    hoverDeck, event, insetY, cardHeight, cardElement, placeholderNode,
}: {
    hoverDeck: HTMLElement;
    event: MouseEvent;
    insetY: number;
    cardHeight: number;
    cardElement: HTMLElement;
    placeholderNode: HTMLElement;
}) {
    if (!hoverDeck) return;
    const {
        bottom: deckBottom, left: deckLeft, width: deckWidth,
    } = hoverDeck.getBoundingClientRect();
    const deckCenter = (deckLeft + deckWidth / 2) | 0;

    const topY = event.clientY - insetY;
    const bottomY = event.clientY - insetY + cardHeight;

    const cardElementUnderTopEdge = findCardAt(deckCenter, topY, cardElement);
    const cardElementUnderBottomEdge = findCardAt(
        deckCenter,
        bottomY,
        cardElement
    );

    if (cardElementUnderTopEdge &&
        event.clientY - insetY <= middleOfElement(cardElementUnderTopEdge)) {
        cardElementUnderTopEdge.parentNode.insertBefore(
            placeholderNode,
            cardElementUnderTopEdge
        );
    } else if (cardElementUnderBottomEdge &&
        event.clientY - insetY + cardHeight >= middleOfElement(cardElementUnderBottomEdge)) {
        cardElementUnderBottomEdge.parentNode.insertBefore(
            placeholderNode,
            cardElementUnderBottomEdge
        );
    } else if (!cardElementUnderBottomEdge &&
        event.clientY - insetY + cardHeight >= deckBottom) {
        hoverDeck.append(placeholderNode);
    }
}
