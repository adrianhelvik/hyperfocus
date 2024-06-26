export function isKeypressElement(element: HTMLElement | EventTarget) {
  if (!(element instanceof HTMLElement)) return false;
  return element.tagName === "INPUT" || element.tagName === "TEXTAREA";
}
