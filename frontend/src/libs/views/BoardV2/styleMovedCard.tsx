export function styleMovedCard(opts: {
    event: MouseEvent;
    cardElement: HTMLElement;
    insetX: number;
    insetY: number;
}) {
    Object.assign(opts.cardElement.style, {
        position: "fixed",
        top: 0,
        left: 0,
        transform: [
            `translateX(${opts.event.clientX - opts.insetX}px)`,
            `translateY(${opts.event.clientY - opts.insetY}px)`,
        ].join(" "),
    });
}

