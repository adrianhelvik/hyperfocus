import { css } from "styled-components";

export const cssFilter = (input: string) => {
  return css`
    -webkit-backdrop-filter: ${input};
    backdrop-filter: ${input};
  `;
};
