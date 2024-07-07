export default function isDetached(element: HTMLElement | ParentNode | null) {
  if (!element) return true;
  if (element === document.body) return false;
  return isDetached(element.parentNode);
}
