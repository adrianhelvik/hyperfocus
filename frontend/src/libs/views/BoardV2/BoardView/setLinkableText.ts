import { createLinkableTextFragment } from "./createLinkableTextFragment";

export function setLinkableText<T extends HTMLElement>(
  element: T,
  content: string
): T {
  element.textContent = "";
  element.append(createLinkableTextFragment(content));
  return element;
}
