import { distanceBetween } from "./distanceBetween";
import startScrollWhenNearEdges from "./startScrollWhenNearEdges";

let bodyUserSelectNoneTimeout: ReturnType<typeof setTimeout> | null = null;

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

  const initializeDrag = (opts: {
    initialCoords: { x: number; y: number };
    startNow: boolean;
    cleanup: () => void;
  }) => {
    const dragContext = {
      init: null as {
        context: Context;
        stopScroll: () => void;
      } | null,
      onMove(clientX: number, clientY: number) {
        if (this.init) {
          options.onDragMove(clientX, clientY, this.init.context);
        } else if (
          !this.init &&
          distanceBetween({ x: clientX, y: clientY }, opts.initialCoords) > 10
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
        opts.cleanup();
      },
    };

    if (opts.startNow) {
      dragContext.init = {
        context: options.onDragStart(opts.initialCoords.x, opts.initialCoords.y),
        stopScroll: startScrollWhenNearEdges(options.scrollContainer),
      };
    }

    return dragContext;
  };

  function onMouseDown(e: MouseEvent) {
    // Ignore anything but left clicks
    if (e.button !== 0) return;

    if (options.shouldIgnoreStart(e.target)) return;

    e.preventDefault();

    const dragContext = initializeDrag({
      startNow: false,
      initialCoords: {
        x: e.clientX,
        y: e.clientY,
      },
      cleanup: () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }
    });

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

    const initialCoords = {
      x: touch.clientX,
      y: touch.clientY,
    };

    const touchIdentifier = touch.identifier;

    const timeout = setTimeout(() => {
      onDelayedTouchStart();
    }, 1000);

    const preventDefault = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.body.style.userSelect = "none";

    if (bodyUserSelectNoneTimeout) clearTimeout(bodyUserSelectNoneTimeout);
    bodyUserSelectNoneTimeout = setTimeout(() => {
      document.body.style.userSelect = "";
    }, 2000);

    const afterInitialTouch = () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("touchend", afterInitialTouch);
    };

    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("touchmove", onInitialTouchMove);
    document.addEventListener("touchend", afterInitialTouch);

    function stopInitialListener() {
      document.removeEventListener("touchmove", onInitialTouchMove);
      document.removeEventListener("touchend", stopInitialListener);
      clearTimeout(timeout);
    }

    function onInitialTouchMove(e: TouchEvent) {
      const currentTouch = Array.from(e.touches).find(
        (it) => it.identifier === touchIdentifier
      );
      if (!currentTouch || distanceBetween(initialCoords, { x: currentTouch.clientX, y: currentTouch.clientY }) > 5) {
        stopInitialListener();
      }
    }

    function onDelayedTouchStart() {
      stopInitialListener();

      const moveContext = initializeDrag({
        startNow: true,
        initialCoords,
        cleanup: () => {
          document.removeEventListener("touchmove", onTouchMove);
          document.removeEventListener("touchend", onTouchEnd);
        }
      });

      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
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

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    }
  }

  return () => {
    options.element.removeEventListener("mousedown", onMouseDown);
    options.element.removeEventListener("touchstart", onTouchStart);
  };
}
