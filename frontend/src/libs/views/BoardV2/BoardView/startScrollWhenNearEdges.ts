import clamp from "src/util/clamp";

const AUTO_SCROLL_OFFSET = 100;
const MULTIPLIER = 4;

export default function startScrollWhenNearEdges(root: HTMLElement) {
  let scrollDirection: "NONE" | "LEFT" | "RIGHT" = "NONE";
  let multiplier = 1;

  const updateDirection = (clientX: number) => {
    if (clientX < AUTO_SCROLL_OFFSET) {
      multiplier = (clamp(AUTO_SCROLL_OFFSET - clientX, 0, AUTO_SCROLL_OFFSET) / AUTO_SCROLL_OFFSET) ** 2 * MULTIPLIER;
      scrollDirection = "LEFT";
    } else if (clientX >= window.innerWidth - AUTO_SCROLL_OFFSET) {
      multiplier = (clamp(AUTO_SCROLL_OFFSET - (window.innerWidth - clientX), 0, AUTO_SCROLL_OFFSET) / AUTO_SCROLL_OFFSET) ** 2 * MULTIPLIER;
      scrollDirection = "RIGHT";
    } else {
      scrollDirection = "NONE";
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    updateDirection(e.clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      updateDirection(e.touches[0].clientX);
    } else {
      scrollDirection = "NONE";
    }
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("touchmove", onTouchMove);

  const scrollInterval = setInterval(() => {
    if (scrollDirection === "LEFT") {
      root.scrollBy({ left: -multiplier });
    }
    if (scrollDirection === "RIGHT") {
      root.scrollBy({ left: multiplier });
    }
  });

  return () => {
    clearInterval(scrollInterval);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onTouchMove);
  };
}
