export function el<TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  properties?: Omit<Partial<HTMLElementTagNameMap[TagName]>, "style"> & {
    style?: Partial<HTMLElementTagNameMap[TagName]["style"]>;
  },
  ...children: (Node | string)[]
): HTMLElementTagNameMap[TagName] {
  const element = document.createElement(tagName);

  if (properties) {
    for (const key in properties) {
      if (!Object.hasOwn(properties, key)) continue;

      switch (key) {
        case "dataset":
          Object.assign(element[key], properties[key]);
          break;
        case "style":
          for (const styleKey in properties.style) {
            if (!Object.hasOwn(properties.style, styleKey)) continue;
            const value = properties.style[styleKey] as any;
            if (styleKey.startsWith("--")) {
              element.style.setProperty(styleKey, value);
            } else {
              element.style[styleKey as any] = value;
            }
          }
          break;
        default:
          // XXX: This seems impossible to type well
          // @ts-ignore
          element[key] = properties[key];
      }
    }
  }

  element.append(...children);

  return element;
}
