import { debugElement } from "./domUtils";

export function findClosestDeck(deckElements: HTMLElement[], x: number) {
  let prev = deckElements[0];
  for (let i = 1; i < deckElements.length; i++) {
    const node = deckElements[i];
    const rect = node.getBoundingClientRect();

    if (x < rect.left) {
      debugElement(prev);
      return prev;
    }
    prev = node;
  }
  const element = deckElements[deckElements.length - 1] ?? null;
  debugElement(element);
  return element;
}
