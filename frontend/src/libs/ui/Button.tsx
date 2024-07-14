import styled, { css } from "styled-components";
import * as theme from "src/libs/theme";

export default styled.button<{ $danger?: boolean; $gray?: boolean }>`
  background-color: ${theme.baseColor};
  border-radius: 4px;
  padding: 7px 10px;
  color: white;
  text-align: center;
  cursor: pointer;
  display: block;
  border: none;
  font-size: inherit;
  margin: 0;

  ${(p) => {
    if (p.disabled) {
      return css`
        cursor: not-allowed;
        background-color: ${theme.gray2};
        color: ${theme.gray1};
      `;
    }
    if (p.$danger)
      return css`
        background-color: ${theme.red};
      `;
    if (p.$gray)
      return css`
        background-color: ${theme.grayButtonBg};
        color: ${theme.grayButtonFg};
      `;
    return css`
      transition: background-color 0.3s, box-shadow 0.3s;

      &:hover {
        background-color: ${theme.ui2};
      }

      &:hover:active {
        background-color: ${theme.darkPurple};
      }
    `;
  }}
`;
