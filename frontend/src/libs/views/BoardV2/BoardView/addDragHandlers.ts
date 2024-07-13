import startScrollWhenNearEdges from "./startScrollWhenNearEdges";

export default function addDragHandlers(
  options: {
    scrollContainer: HTMLElement,
    element: HTMLElement,
    shouldIgnoreStart(target: EventTarget | null): boolean;
    onDragStart(clientX: number, clientY: number): void;
    onDragMove(clientX: number, clientY: number): void;
    onDragEnd(clientX: number, clientY: number, target: EventTarget | null): void;
  }
) {
  options.element.addEventListener("mousedown", onMouseDown);
  options.element.addEventListener("touchstart", onTouchStart);

  function onMouseDown(e: MouseEvent) {
    if (options.shouldIgnoreStart(e.target)) return;

    e.preventDefault();

    const stopScroll = startScrollWhenNearEdges(options.scrollContainer);
    options.onDragStart(e.clientX, e.clientY);

    const onMouseMove = (e: MouseEvent) => {
      options.onDragMove(e.clientX, e.clientY);
    };

    document.addEventListener("mousemove", onMouseMove);

    const onMouseUp = (e: MouseEvent) => {
      options.onDragEnd(e.clientX, e.clientY, e.target);
      stopScroll();

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mouseup", onMouseUp);
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;

    let touch = e.touches[0];

    if (options.shouldIgnoreStart(touch.target)) return;

    const touchIdentifier = touch.identifier;
    const stopScroll = startScrollWhenNearEdges(options.element);

    e.preventDefault();
    options.onDragStart(touch.clientX, touch.clientY);

    const onTouchMove = (e: TouchEvent) => {
      const currentTouch = Array.from(e.touches).find(it => it.identifier === touchIdentifier);
      if (currentTouch) {
        touch = currentTouch;
        options.onDragMove(currentTouch.clientX, currentTouch.clientY);
      } else {
        onTouchEnd(e);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      let currentTouch = Array.from(e.changedTouches).find(it => it.identifier === touchIdentifier);
      if (!currentTouch) {
        console.error("Failed to find touch in touchend event");
        currentTouch = touch;
      }
      options.onDragEnd(currentTouch.clientX, currentTouch.clientY, currentTouch.target);
      stopScroll();

      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  }

  return () => {
    options.element.removeEventListener("mousedown", onMouseDown);
    options.element.removeEventListener("touchstart", onTouchStart);
  };
}
