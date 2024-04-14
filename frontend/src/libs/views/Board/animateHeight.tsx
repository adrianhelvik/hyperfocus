import easeInOutQuad from "src/libs/easeInOutQuad";

export default function animateHeight(
    element: HTMLElement,
    opts: { from: number; to: number | "auto"; time: number }
) {
    const start = Date.now();

    const to = opts.to === "auto" ? autoHeight(element) : opts.to;

    let raf = requestAnimationFrame(paint);

    function paint() {
        const now = Date.now();
        const progress =
            Math.max(Math.min((now - start) / opts.time, 1), 0) || 0;
        const animationStep = easeInOutQuad(progress);

        const height = opts.from * (1 - animationStep) + to * animationStep;

        element.style.height = `${height}px`;

        if (progress >= 1) return;

        raf = requestAnimationFrame(paint);
    }
}

function autoHeight(element: HTMLElement) {
    try {
        var original = element.style.height;
        element.style.height = null;
        return element.offsetHeight;
    } finally {
        element.style.height = original;
    }
}
