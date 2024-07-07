import getCaretPositionAndNodeFromPoint from "./getCaretPositionAndNodeFromPoint";

export function replaceWithInputAndFocusAtCaretPosition(opts: {
  clientX: number | null,
  clientY: number | null,
  sourceElement: HTMLElement,
  inputElement: HTMLInputElement | HTMLTextAreaElement,
}) {
  const result = opts.clientX != null && opts.clientY != null
    ? getCaretPositionAndNodeFromPoint(opts.clientX, opts.clientY)
    : null;

  opts.inputElement.value = opts.sourceElement.textContent ?? "";
  opts.sourceElement.replaceWith(opts.inputElement);
  opts.inputElement.focus();

  const moveToEnd = () => {
    opts.inputElement.selectionStart = opts.inputElement.value.length;
    opts.inputElement.selectionEnd = opts.inputElement.value.length;
  };

  if (result == null) {
    moveToEnd();
  } else {
    const nodes = Array.from(opts.sourceElement.childNodes);
    const index = nodes.findIndex((it: Node) => it.contains(result.node));
    if (index !== -1) {
      let offset = result.offset;
      for (let i = 0; i < index; i++) {
        offset += nodes[i].textContent?.length ?? 0;
      }
      opts.inputElement.selectionStart = offset;
      opts.inputElement.selectionEnd = offset;
    } else {
      moveToEnd();
    }
  }
}
