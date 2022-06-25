import styled, { css } from 'styled-components'
import * as theme from 'theme'

export default styled.button`
  background-color: ${theme.ui1};
  border-radius: 4px;
  padding: 7px 10px;
  color: white;
  text-align: center;
  cursor: pointer;
  display: block;
  border: none;
  font-size: inherit;
  margin: 0;

  ${p => {
    if (p.$danger)
      return css`
        background-color: ${theme.red};
      `
    if (p.$gray)
      return css`
        background-color: ${theme.gray2};
        color: black;
      `
    return css`
      transition: background-color 0.3s, box-shadow 0.3s;

      :hover {
        background-color: ${theme.ui2};
      }

      :hover:active {
        background-color: ${theme.darkPurple};
      }
    `
  }}
`
