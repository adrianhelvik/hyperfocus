export default function onSelect(fn) {
  return {
    tabIndex: 0,
    onClick: fn,
    onKeyDown: event => {
      if (event.which === 13) {
        event.preventDefault() // Prevent buttons from triggering submit
        fn(event)
      }
    },
  }
}
