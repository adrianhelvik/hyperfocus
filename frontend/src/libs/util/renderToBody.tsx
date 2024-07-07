import { createRoot } from "react-dom/client";

export default (template: any) => {
  const rootElement = document.createElement("div");
  document.body.appendChild(rootElement);
  const root = createRoot(rootElement);
  root.render(template);
  return {
    remove: () => {
      root.unmount();
      rootElement.parentNode?.removeChild(rootElement);
    },
    rerender: (template: any) => {
      root.render(template);
    },
  };
};
