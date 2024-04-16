export default function createAutoGrowTextarea(): HTMLTextAreaElement {
  const element = document.createElement("textarea");
  element.style.resize = "none";

  const interval = setInterval(() => {
    if (!element.parentElement) return;
    sizeElementRepeatedly(element);
    clearInterval(interval);
  });

  element.addEventListener("input", () => {
    sizeElementRepeatedly(element);
  });

  element.addEventListener("focus", () => {
    sizeElementRepeatedly(element);
  });

  element.addEventListener("blur", () => {
    sizeElementRepeatedly(element);
  });

  return element;
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
