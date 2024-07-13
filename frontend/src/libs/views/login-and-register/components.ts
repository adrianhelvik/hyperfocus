import styled, { createGlobalStyle, css } from "styled-components";
import * as theme from "src/libs/theme";
import Color from "color";

export const GlobalStyle = createGlobalStyle`
  body {
      background: ${theme.smoothGradient};
  }
`;

export const LogoWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    margin-top: 50px;
`;

export const Container = styled.div`
    color: white;
    height: 100dvh;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
`;

export const Content = styled.div`
  margin: 0 auto;
  margin-top: 10vh;
`;

export const Form = styled.form`
  margin: auto;
  padding-bottom: 100px;
  display: grid;
  grid-auto-flow: row;
  gap: 25px;
  max-width: calc(100vw - 60px);
`;

export const Message = styled.div`
  color: ${theme.brightBlue};
  text-align: center;
  letter-spacing: 1px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  & strong {
    display: block;
  }
`;

export const Button = styled.button<{ $secondary?: boolean }>`
  background-color: ${theme.brightBlue};
  border-radius: 4px;
  padding: 10px 10px;
  font-weight: bold;
  color: ${Color(theme.brightBlue).mix(Color("black"), 0.8).hex()};
  text-align: center;
  cursor: pointer;
  display: block;
  border: none;
  font-size: inherit;
  margin: 0;

  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: ${theme.brightBlue};
  }

  &:focus {
    background-color: ${theme.brightBlue};
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${theme.brightBlue};
    outline-offset: 2px;
  }

  &:hover:active {
    background-color: ${theme.darkPurple};
  }

  ${p => p.$secondary && css`
    background-color: ${Color(theme.brightBlue).mix(Color("#000"), 0.6).hex()};
    color: ${Color(theme.brightBlue).mix(Color("white"), 0.2).mix(Color("black"), 0.2).hex()};
    font-weight: normal;

    &:focus {
      background-color: ${Color(theme.brightBlue).mix(Color("#000"), 0.6).hex()};
    }
  `}
`;

export const Heading = styled.h1`
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  text-align: center;
  margin-top: 30px;
  margin-bottom: 30px;
  opacity: 0.8;
`;
