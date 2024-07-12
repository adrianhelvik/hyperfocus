export const getElementPositionsInGrid = (root: Element) => {
    const positionedElements: Array<{ x: number, y: number, element: Element }> = [];
    if (!root || !root.children.length) {
        return positionedElements;
    }
    let x = 0;
    let y = 0;
    positionedElements.push({
        element: root.children[0],
        x,
        y,
    });
    for (let i = 1; i < root.children.length; i++) {
        const child = root.children[i];
        if (!child) continue;
        x += 1;
        const prev = positionedElements[positionedElements.length - 1].element.getBoundingClientRect();
        const rect = child.getBoundingClientRect();
        if (rect.left <= prev.left) {
            x = 0;
            y += 1;
        }
        positionedElements.push({
            element: root.children[i],
            x,
            y,
        });
    }
    return positionedElements;
}


