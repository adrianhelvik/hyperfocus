export default function someParent(element, fn) {
  if (!element || element === document) return null
  if (fn(element)) return element
  return someParent(element.parentNode, fn)
}
