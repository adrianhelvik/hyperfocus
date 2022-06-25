export default function ellipsify(text, length = 60) {
  if (typeof text !== 'string') return text

  if (text.length < length) {
    return text
  }

  return text.slice(0, length - 3) + '...'
}
