import { createGlobalStyle } from "styled-components";
import * as theme from "src/libs/theme";

export const GlobalStyle = createGlobalStyle`
  body {
    background: ${theme.smoothGradient};
  }

  * {
    --webkit-scrollbar-width: 0 !important;
    scrollbar-width: 0 !important;
  }
`;
