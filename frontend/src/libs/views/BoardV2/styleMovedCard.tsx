export function styleMovedCard(opts: {
    clientX: number;
    clientY: number;
    cardElement: HTMLElement;
    insetX: number;
    insetY: number;
}) {
    Object.assign(opts.cardElement.style, {
        position: "fixed",
        top: 0,
        left: 0,
        transform: [
            `translateX(${opts.clientX - opts.insetX}px)`,
            `translateY(${opts.clientY - opts.insetY}px)`,
        ].join(" "),
    });
}
