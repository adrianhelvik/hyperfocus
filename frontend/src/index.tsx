import "./globals";

import { shouldForwardProp, setup } from "solid-styled-components";
import { render } from "solid-js/web";
import "./index.css";
import "./debug";

import App from "./App";

setup(
    null,
    shouldForwardProp((prop) => !prop.startsWith("$")),
);

render(() => <App />, document.getElementById("root")!);
