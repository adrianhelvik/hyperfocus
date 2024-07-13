import styled, { createGlobalStyle, css } from "styled-components";
import * as theme from "src/libs/theme";
import Color from "color";

export const GlobalStyle = createGlobalStyle`
  body {
      background: ${theme.smoothGradientMellow};
  }
  @media (hover: none) {
    body {
        background: ${theme.smoothGradient};
    }
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
  color: ${theme.baseColor};
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
  background-color: ${theme.baseColor};
  border-radius: 4px;
  padding: 10px 10px;
  font-weight: bold;
  color: ${Color(theme.baseColor).mix(Color("black"), 0.8).hex()};
  text-align: center;
  cursor: pointer;
  display: block;
  border: none;
  font-size: inherit;
  margin: 0;

  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: ${theme.baseColor};
  }

  &:focus {
    background-color: ${theme.baseColor};
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${theme.baseColor};
    outline-offset: 2px;
  }

  &:hover:active {
    background-color: ${theme.darkPurple};
  }

  ${p => p.$secondary && css`
    background-color: ${Color(theme.baseColor).mix(Color("#000"), 0.6).hex()};
    color: ${Color(theme.baseColor).mix(Color("white"), 0.2).mix(Color("black"), 0.2).hex()};
    font-weight: normal;

    &:focus {
      background-color: ${Color(theme.baseColor).mix(Color("#000"), 0.6).hex()};
    }
  `}
`;

export const Heading = styled.h1`
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
  opacity: 0.7;
`;
