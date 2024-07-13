import { createGlobalStyle } from "styled-components";
import * as theme from "src/libs/theme";

console.log(theme.smoothGradient);

export const GlobalStyle = createGlobalStyle`
    body {
        background: ${theme.smoothGradientMellow};
    }
`;
