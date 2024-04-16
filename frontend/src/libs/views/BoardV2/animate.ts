import easeInOutQuad from "src/libs/easeInOutQuad";
import onlyOnceFn from "./onlyOnceFn";

export default function animate(opts: {
  values: Record<string, [number, number]>;
  time: number;
  onComplete: () => void;
  fn: (values: Record<string, number>) => void;
}) {
  let cancelled = false;

  const start = Date.now();
  let af: ReturnType<typeof requestAnimationFrame>;
  let progress = 0;

  const updatedValues: Record<string, number> = {};
  updateAndRun();

  const cleanup = onlyOnceFn(() => {
    progress = 1;
    updateAndRun();
    cancelled = true;
    opts.onComplete();
  });

  const loop = () => {
    if (cancelled) return;
    const now = Date.now();
    progress = easeInOutQuad(Math.min((now - start) / opts.time, 1));
    updateAndRun();
    if (progress < 1) {
      af = requestAnimationFrame(loop);
    } else {
      cleanup();
    }
  };

  af = requestAnimationFrame(loop);

  function updateAndRun() {
    for (const [key, [init, final]] of Object.entries(opts.values)) {
      updatedValues[key] = init * (1 - progress) + final * progress;
    }
    opts.fn(updatedValues);
  }

  return () => {
    cleanup();
  };
}
