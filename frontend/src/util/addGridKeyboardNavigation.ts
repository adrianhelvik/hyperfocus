import { getElementPositionsInGrid } from "./getElementPositionsInGrid";

export default function addGridKeyboardNavigation(gridElement: Element) {
  const focus = (element: Element | null | undefined) => {
    if (element instanceof HTMLElement) {
      element.focus();
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const focusChild = (dir: "up" | "down" | "left" | "right" | "up") => {
    if (!gridElement) return;
    if (
      !document.activeElement ||
      !gridElement.contains(document.activeElement) ||
      gridElement === document.activeElement
    ) {
      if (gridElement.children[0] instanceof HTMLElement) {
        focus(gridElement.children[0]);
      }
    } else {
      const positions = getElementPositionsInGrid(gridElement);
      const index = positions.findIndex((it) =>
        it.element.contains(document.activeElement)
      );

      switch (dir) {
        case "right": {
          focus(
            positions.find(
              (it) =>
                it.x === positions[index].x + 1 && it.y === positions[index].y
            )?.element
          );
          break;
        }
        case "left": {
          focus(
            positions.find(
              (it) =>
                it.x === positions[index].x - 1 && it.y === positions[index].y
            )?.element
          );
          break;
        }
        case "up": {
          focus(
            positions.find(
              (it) =>
                it.y === positions[index].y - 1 && it.x === positions[index].x
            )?.element
          );
          break;
        }
        case "down": {
          focus(
            positions.find(
              (it) =>
                it.y === positions[index].y + 1 && it.x === positions[index].x
            )?.element
          );
          break;
        }
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
        focusChild("right");
        break;
      case "ArrowLeft":
        focusChild("left");
        break;
      case "ArrowDown":
        focusChild("down");
        break;
      case "ArrowUp":
        focusChild("up");
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);

  return () => {
    document.removeEventListener("keydown", onKeyDown);
  };
}
