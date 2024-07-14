import { createGlobalStyle } from "styled-components";
import * as theme from "src/libs/theme";

export const GlobalStyle = createGlobalStyle`
    body {
        background: fixed ${theme.smoothGradientMellow};
    }
`;
