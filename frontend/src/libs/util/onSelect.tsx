export default function onSelect(fn: (event: any) => void) {
  return {
    tabIndex: 0,
    onClick: fn,
    onKeyDown: (event: any) => {
      if (event.which === 13) {
        event.preventDefault(); // Prevent buttons from triggering submit
        fn(event);
      }
    },
  };
}
