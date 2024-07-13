import { distanceBetween } from "./distanceBetween";
import startScrollWhenNearEdges from "./startScrollWhenNearEdges";

export default function addDragHandlers<Context>(options: {
  scrollContainer: HTMLElement;
  element: HTMLElement;
  shouldIgnoreStart(target: EventTarget | null): boolean;
  onDragStart(clientX: number, clientY: number): Context;
  onDragMove(clientX: number, clientY: number, context: Context): void;
  onDragEnd(clientX: number, clientY: number, context: Context): void;
  onClick(clientX: number, clientY: number, target: EventTarget | null): void;
}) {
  options.element.addEventListener("mousedown", onMouseDown);
  options.element.addEventListener("touchstart", onTouchStart);

  const initializeDrag = (
    initialCoords: { x: number; y: number },
    cleanup: () => void
  ) => {
    return {
      init: null as {
        context: Context;
        stopScroll: () => void;
      } | null,
      onMove(clientX: number, clientY: number) {
        if (this.init) {
          options.onDragMove(clientX, clientY, this.init.context);
        } else if (
          !this.init &&
          distanceBetween({ x: clientX, y: clientY }, initialCoords) > 10
        ) {
          this.init = {
            context: options.onDragStart(clientX, clientY),
            stopScroll: startScrollWhenNearEdges(options.scrollContainer),
          };
        }
      },
      onEnd(clientX: number, clientY: number, target: EventTarget | null) {
        if (this.init) {
          options.onDragEnd(clientX, clientY, this.init.context);
          this.init.stopScroll();
        } else {
          options.onClick(clientX, clientY, target);
        }
        cleanup();
      },
    };
  };

  function onMouseDown(e: MouseEvent) {
    // Ignore anything but left clicks
    if (e.button !== 0) return;

    if (options.shouldIgnoreStart(e.target)) return;

    e.preventDefault();

    const dragContext = initializeDrag(
      {
        x: e.clientX,
        y: e.clientY,
      },
      () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }
    );

    const onMouseMove = (e: MouseEvent) => {
      dragContext.onMove(e.clientX, e.clientY);
    };

    const onMouseUp = (e: MouseEvent) => {
      dragContext.onEnd(e.clientX, e.clientY, e.target);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;

    let touch = e.touches[0];

    if (options.shouldIgnoreStart(touch.target)) return;

    const touchIdentifier = touch.identifier;

    e.preventDefault();
    const moveContext = initializeDrag(
      {
        x: touch.clientX,
        y: touch.clientY,
      },
      () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      }
    );

    const onTouchMove = (e: TouchEvent) => {
      const currentTouch = Array.from(e.touches).find(
        (it) => it.identifier === touchIdentifier
      );
      if (currentTouch) {
        touch = currentTouch;
        moveContext.onMove(currentTouch.clientX, currentTouch.clientY);
      } else {
        moveContext.onEnd(touch.clientX, touch.clientY, touch.target);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      let currentTouch = Array.from(e.changedTouches).find(
        (it) => it.identifier === touchIdentifier
      );
      if (!currentTouch) {
        console.error("Failed to find touch in touchend event");
        currentTouch = touch;
      }
      moveContext.onEnd(
        currentTouch.clientX,
        currentTouch.clientY,
        currentTouch.target
      );
    };

    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  }

  return () => {
    options.element.removeEventListener("mousedown", onMouseDown);
    options.element.removeEventListener("touchstart", onTouchStart);
  };
}
