import "./globals";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./debug";

const root = createRoot(document.getElementById("root"));

const render = async () => {
  const { default: App } = await import("./App");
  root.render(<App />);
};

render();

if (import.meta.hot) {
  import.meta.hot.accept("./App", () => {
    console.log("-- force updating app --");
    render();
  });
}
