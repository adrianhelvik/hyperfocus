import { createGlobalStyle } from "styled-components";
import * as theme from "src/libs/theme";

export const GlobalStyle = createGlobalStyle`
  body {
    background: ${theme.smoothGradient};
  }

  * {
    --webkit-scrollbar-width: none !important;
    scrollbar-width: none !important;
  }
`;
