import classes from "./styles.module.css";

const DEBUG_ENABLED = new URLSearchParams(window.location.search).has("debug");

export function verticalMiddle(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    return rect.top + rect.height / 2;
}

export function horizontalMiddle(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    return rect.left + rect.width / 2;
}

export function findCardAt(
    x: number,
    y: number,
    excludedCardNode: HTMLElement
): HTMLElement {
    const cardElements = Array.from(document.querySelectorAll("[data-card-id]"));
    for (const element of cardElements) {
        // Typescript assertion
        if (!(element instanceof HTMLElement)) continue;

        if (element.classList.contains(classes.movingCard)) continue;
        const rect = element.getBoundingClientRect();
        if (x < rect.left) continue;
        if (x > rect.left + rect.width) continue;
        if (y < rect.top) continue;
        if (y > rect.top + rect.height) continue;
        return element;
    }
}

const tempStyleTimeouts = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

export function tempStyle<StyleProp extends keyof HTMLElement["style"]>(
    element: HTMLElement | null,
    styleProp: StyleProp,
    styleVal: HTMLElement["style"][StyleProp]
) {
    if (element == null) return;

    element.style[styleProp] = styleVal;

    if (tempStyleTimeouts.has(element)) {
        clearTimeout(tempStyleTimeouts.get(element));
    }

    const timeout = setTimeout(() => {
        element.style[styleProp] = null;
    }, 500);

    tempStyleTimeouts.set(element, timeout);
}

const debugElementInfo = new Map<Element, { timeouts: Array<ReturnType<typeof setTimeout>>, element: Element }>();

export function debugElement(element: Element | null, color = "red") {
    if (!DEBUG_ENABLED) return;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const debugInfo = debugElementInfo.get(element);
    if (debugInfo) {
        for (const timeout of debugInfo.timeouts) {
            clearTimeout(timeout);
        }
        debugInfo.element.remove();
    }
    const debugElement = document.createElement("div");
    const borderWidth = 4;
    const offset = 4 + borderWidth;
    Object.assign(debugElement.style, {
        position: "fixed",
        left: `${rect.left - offset}px`,
        top: `${rect.top - offset}px`,
        width: `${rect.width + offset * 2}px`,
        height: `${rect.height + offset * 2}px`,
        border: `${borderWidth}px solid ${color}`,
        zIndex: "100000",
        transition: "opacity 500ms",
    });
    document.body.append(debugElement);
    const timeouts = [
        setTimeout(() => {
            debugElement.style.opacity = "0";
        }),
        setTimeout(() => {
            debugElement.remove();
        }, 500),
    ];
    debugElementInfo.set(element, { timeouts, element: debugElement });
}
