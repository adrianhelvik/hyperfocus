export default function someParent(
    element: HTMLElement | null,
    fn: (element: HTMLElement) => unknown
): HTMLElement | null {
    if (!element) return null;
    if (fn(element)) return element;
    return someParent(element.parentElement, fn);
}
