import styled, { css } from "styled-components";
import * as theme from "src/libs/theme";
import Color from "color";
import { brighten, darken } from "../colorFns";

const grayBg = Color("#777").alpha(0.8).string();

export default styled.button<{ $danger?: boolean; $cancel?: boolean, $white?: boolean }>`
  transition: background-color 0.3s, box-shadow 0.3s;
  background-color: ${theme.baseColor};
  border-radius: 4px;
  padding: 7px 10px;
  color: ${Color(theme.baseColor).isDark() ? "white" : "black"};
  text-align: center;
  cursor: pointer;
  display: block;
  border: none;
  font-size: inherit;
  margin: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:focus {
    outline: 2px solid ${theme.baseColor};
    outline-offset: 2px;
  }

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
    if (p.$cancel)
      return css`
        background-color: ${grayBg};
        color: white;

        &:hover {
          background-color: ${brighten(grayBg, 0.2)};
        }

        &:hover:active {
          background-color: ${darken(grayBg, 0.2)};
        }
      `;
    if (p.$white)
      return css`
        background-color: white;
        color: ${grayBg};

        &:hover {
          background-color: ${darken("white", 0.2)};
        }

        &:hover:active {
          background-color: ${darken("white", 0.2)};
        }
      `;
    return css`
      &:hover {
        background-color: ${brighten(theme.baseColor, 0.2)};
      }

      &:hover:active {
        background-color: ${darken(theme.baseColor, 0.2)};
      }
    `;
  }}
`;
