export function makeTextAreaAutoGrow(element: HTMLTextAreaElement) {
  element.style.resize = "none";
  (element.style as any).fieldSizing = "content";

  const interval = setInterval(() => {
    if (!element.parentElement) return;
    sizeElementRepeatedly(element);
    clearInterval(interval);
  });

  const resize = () => {
    sizeElementRepeatedly(element);
  };

  element.addEventListener("input", resize);
  element.addEventListener("focus", resize);
  element.addEventListener("blur", resize);

  return () => {
    clearInterval(interval);
    element.removeEventListener("input", resize);
    element.removeEventListener("focus", resize);
    element.removeEventListener("blur", resize);
  };
}

function sizeElement(element: HTMLTextAreaElement) {
  element.style.height = "0px";
  element.style.height = `${element.scrollHeight}px`;
}

/**
 * This seemed like a good enough solution without having
 * to mess around with MutationObserver, as this is an
 * element without any explicit lifecycle management.
 */
function sizeElementRepeatedly(element: HTMLTextAreaElement) {
  sizeElement(element);
  setTimeout(() => sizeElement(element), 100);
  setTimeout(() => sizeElement(element), 300);
  setTimeout(() => sizeElement(element), 500);
  setTimeout(() => sizeElement(element), 1000);
}

