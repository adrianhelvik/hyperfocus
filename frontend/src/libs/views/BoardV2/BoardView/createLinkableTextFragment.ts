const URL_REGEX =
  /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
const SEPARATOR: string = `_SEPARATOR_${crypto.randomUUID()}_SEPARATOR_`;

export function createLinkableTextFragment(content: string): DocumentFragment {
  const fragment = document.createDocumentFragment();

  let urlCount = 0;
  const urls: string[] = [];
  const template = content.replace(URL_REGEX, (match: string) => {
    urlCount += 1;
    urls.push(match);
    return SEPARATOR;
  });
  const parts = template.split(SEPARATOR);

  if (parts[0]) {
    fragment.append(parts[0]);
  }

  for (let i = 0; i < urlCount; i++) {
    const url = urls[i];
    const text = parts[i + 1];

    appendAnchor(fragment, url);
    fragment.append(text);
  }

  return fragment;
}

function appendAnchor(element: ParentNode, url: string) {
  const anchor = document.createElement("a");
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.href = url;
  anchor.textContent = url;
  element.append(anchor);
}
