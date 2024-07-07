export function isKeypressElement(element: HTMLElement | EventTarget | null): boolean {
  if (!element) return false;
  if (!(element instanceof HTMLElement)) return false;
  return element.tagName === "INPUT" || element.tagName === "TEXTAREA";
}
