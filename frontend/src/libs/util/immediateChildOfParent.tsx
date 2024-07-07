export default function immediateChildOfParent(element: HTMLElement, fn: (e: HTMLElement) => boolean) {
  if (!element || !element.parentNode) return null;

  if (fn(element.parentNode as HTMLElement)) return element.parentNode;

  return immediateChildOfParent(element.parentNode as HTMLElement, fn);
}
