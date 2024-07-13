import easeInOutQuad from "src/libs/easeInOutQuad";

export function smoothScrollToCenter(opts: {
  scrollContainer: HTMLElement;
  element: HTMLElement;
  time: number;
  onEnd?: () => void;
}) {
  const rect = opts.element.getBoundingClientRect();
  const targetCenter = (rect.left + rect.width / 2) | 0;
  const windowCenter = (window.innerWidth / 2) | 0;
  const scrollStart = opts.scrollContainer.scrollLeft;
  const scrollEnd = targetCenter - windowCenter + scrollStart;
  const start = Date.now();
  let progress = 0;

  const style = () => {
    const animationProgress = easeInOutQuad(progress);
    opts.scrollContainer.scrollLeft =
      animationProgress * scrollEnd + (1 - animationProgress) * scrollStart;
  };

  const next = () => {
    progress = Math.min(Date.now() - start, opts.time) / opts.time;
    style();
    if (progress < 1) {
      af = requestAnimationFrame(next);
    } else {
      cleanup();
    }
  };

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    opts.onEnd?.();
    cancelAnimationFrame(af);
  };

  let af = requestAnimationFrame(next);

  return cleanup;
}
