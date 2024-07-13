const AUTO_SCROLL_OFFSET = 100;

export default function startScrollWhenNearEdges(root: HTMLElement) {
  let scrollDirection: "NONE" | "LEFT" | "RIGHT" = "NONE";

  const updateDirection = (clientX: number) => {
    if (clientX < AUTO_SCROLL_OFFSET) scrollDirection = "LEFT";
    else if (clientX >= window.innerWidth - AUTO_SCROLL_OFFSET)
      scrollDirection = "RIGHT";
    else scrollDirection = "NONE";
  }

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
      root.scrollBy({ left: -3 });
    }
    if (scrollDirection === "RIGHT") {
      root.scrollBy({ left: 2 });
    }
  });


  return () => {
    clearInterval(scrollInterval);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onTouchMove);
  };
}
