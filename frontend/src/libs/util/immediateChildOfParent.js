export default function immediateChildOfParent(element, fn) {
  if (!element || !element.parentNode) return null

  if (fn(element.parentNode)) return element.parentNode

  return immediateChildOfParent(element.parentNode, fn)
}
