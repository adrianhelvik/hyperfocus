import isDetached from "src/libs/util/isDetached";

const outlines = new Map();

setInterval(renderDebugged, 1000);

function renderDebugged() {
    const matchingElements = Array.from(
        document.querySelectorAll("[data-debug]")
    );

    for (const element of matchingElements) {
        const outline = outlines.has(element)
            ? outlines.get(element)
            : createOutline(element);

        const rect = element.getBoundingClientRect();
        const { borderRadius } = getComputedStyle(element);

        Object.assign(outline.style, {
            outline: "1px solid rgba(0, 0, 0, .6)",
            pointerEvents: "none",
            borderRadius,

            position: "fixed",
            zIndex: 10000,

            height: rect.height + "px",
            width: rect.width + "px",
            left: rect.left + "px",
            top: rect.top + "px",
        });
    }

    for (const [element, outline] of outlines) {
        if (isDetached(element) || !element.hasAttribute("data-debug")) {
            if (outline.parentNode) outline.parentNode.removeChild(outline);
            outlines.delete(outline);
        }
    }
}

function createOutline(element: Element) {
    const outline = document.createElement("div");
    document.body.appendChild(outline);
    outlines.set(element, outline);
    return outline;
}

let points = [];

declare global {
    interface Window {
        point: (x: number, y?: number) => void;
        removePoints: () => void;
    }
}

window.point = function point(x, y = 200) {
    const div = document.createElement("div");
    Object.assign(div.style, {
        position: "fixed",
        left: x + "px",
        top: y + "px",
        background: "red",
        height: "3px",
        width: "3px",
        transform: "translateX(-50%) translateY(-50%)",
        zIndex: 10000,
    });
    document.body.appendChild(div);
    points.push(div);
};

window.removePoints = function removePoints() {
    for (const point of points) point.parentNode.removeChild(point);
    points = [];
};
