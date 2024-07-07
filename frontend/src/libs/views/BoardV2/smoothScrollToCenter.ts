const TIME = 300;

export function smootScrollToCenter(container: HTMLElement, target: HTMLElement, onEnd: () => void) {
  const rect = target.getBoundingClientRect();
  const targetCenter = (rect.left + rect.width / 2) | 0;
  const windowCenter = (window.innerWidth / 2) | 0;
  const diff = windowCenter - targetCenter;
  const scrollStart = container.scrollLeft;
  const scrollEnd = targetCenter - windowCenter + scrollStart;
  const start = Date.now();
  let progress = 0;

  const style = () => {
    container.scrollLeft = progress * scrollEnd + (1 - progress) * scrollStart;
  };

  const next = () => {
    progress = Math.min((Date.now() - start), TIME) / TIME;
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
    onEnd();
    cancelAnimationFrame(af);
  };

  let af = requestAnimationFrame(next);

  return cleanup;
}
