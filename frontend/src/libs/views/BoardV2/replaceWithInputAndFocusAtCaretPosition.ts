import getCaretPositionAndNodeFromPoint from "./getCaretPositionAndNodeFromPoint";

export function replaceWithInputAndFocusAtCaretPosition(opts: {
  clientX: number,
  clientY: number,
  sourceElement: HTMLElement,
  inputElement: HTMLInputElement | HTMLTextAreaElement,
}) {
  const result = getCaretPositionAndNodeFromPoint(opts.clientX, opts.clientY);
  opts.inputElement.value = opts.sourceElement.textContent;
  opts.sourceElement.replaceWith(opts.inputElement);
  opts.inputElement.focus();

  if (result != null) {
    const nodes = [].slice.call(opts.sourceElement.childNodes);
    const index = nodes.findIndex((it: Node) => it.contains(result.node));
    if (index !== -1) {
      let offset = result.offset;
      for (let i = 0; i < index; i++) {
        offset += nodes[i].textContent.length;
      }
      opts.inputElement.selectionStart = offset;
      opts.inputElement.selectionEnd = offset;
    } else {
      console.log(result.node);
      opts.inputElement.selectionStart = opts.inputElement.value.length;
      opts.inputElement.selectionEnd = opts.inputElement.value.length;
    }
  }
}
