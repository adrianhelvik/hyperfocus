export default function onSelect(fn: (event: any) => void) {
  return {
    tabIndex: 0,
    onClick: fn,
    onKeyDown: (event: React.KeyboardEvent | KeyboardEvent) => {
      if (event.key.toLowerCase() === "enter") {
        if (event.target instanceof HTMLButtonElement) {
          event.target.click();
        } else {
          event.preventDefault(); // Prevent buttons from triggering submit
          fn(event);
        }
      }
    },
  };
}
