import styled, { css } from 'styled-components'
import * as theme from 'theme'

export default styled.button`
  background-color: ${theme.ui1};
  border-radius: 4px;
  padding: 7px 10px;
  color: white;
  text-align: center;
  margin-top: 30px;
  cursor: pointer;
  display: block;
  border: none;
  font-size: inherit;
  margin-left: auto;
  margin-right: auto;
  box-shadow: ${theme.shadows[0]};

  ${p =>
    p.$danger &&
    css`
      background-color: ${theme.red};
    `}

  ${p =>
    p.$gray &&
    css`
      background-color: ${theme.gray2};
      color: black;
    `}
`
