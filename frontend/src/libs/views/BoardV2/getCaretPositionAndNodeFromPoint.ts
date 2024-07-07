declare global {
  interface Document {
    caretPositionFromPoint(x: number, y: number): any;
  }
}

export default function getCaretPositionAndNodeFromPoint(x: number, y: number) {
  if (document.caretPositionFromPoint) {
    const range = document.caretPositionFromPoint(x, y);
    const node = range.offsetNode;
    return {
      node,
      offset: range.offset,
    };
  } else if (document.caretRangeFromPoint) {
    // Use WebKit-proprietary fallback method
    const range = document.caretRangeFromPoint(x, y);
    if (!range) return;
    const node = range.startContainer;
    return {
      node,
      offset: range.startOffset,
    };
  } else {
    // Neither method is supported, do nothing
    return null;
  }
}
