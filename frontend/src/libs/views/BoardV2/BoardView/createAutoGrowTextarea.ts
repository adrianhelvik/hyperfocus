import { makeTextAreaAutoGrow } from "./makeTextAreaAutoGrow";

export default function createAutoGrowTextarea(): HTMLTextAreaElement {
  const element = document.createElement("textarea");
  makeTextAreaAutoGrow(element);
  return element;
}
