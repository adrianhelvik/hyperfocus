import "./globals";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./debug";
import { StrictMode } from "react";

const root = createRoot(document.getElementById("root")!);

const render = async () => {
  const { default: App } = await import("./App");
  root.render(<StrictMode><App /></StrictMode>);
};

render();

if (import.meta.hot) {
  import.meta.hot.accept("./App", () => {
    console.log("-- force updating app --");
    render();
  });
}
