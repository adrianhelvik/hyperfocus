export default function someParent(
    element: Element | null,
    fn: (element: Element) => boolean,
): Element | null {
    if (!element) return null;
    if (fn(element)) return element;
    return someParent(element.parentElement, fn);
}
