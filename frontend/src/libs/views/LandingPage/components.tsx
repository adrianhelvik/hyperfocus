import { Link } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import * as theme from "../../theme";
import Color from "color";

export const GlobalStyle = createGlobalStyle`
  body {
    background: ${theme.smoothGradient};
    color: ${Color(theme.brightBlue).mix(Color("#555"), 0.2).hex()};
  }
`

export const Title = styled.h1`
  text-align: center;
  font-weight: 300;
  font-size: 70px;
  line-height: 1.57;
  color: white;
  pointer-events: none;

  font-size: min(70px, 10vw);
`;

export const Section = styled.section`
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  min-height: calc(100vh - 75px);
  min-height: calc(100dvh - 75px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  position: relative;
  flex-direction: column;
`;

export const Particles = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
`;

export const Register = styled(Link)`
  font-size: 30px;
  background-color: ${Color(theme.brightBlue).mix(Color("black"), 0.1).hex()};
  border: 4px solid ${theme.brightBlue};
  color: ${Color(theme.brightBlue).mix(Color("black"), 0.6).string()};
  border: 0;
  border-radius: 4px;
  padding: 10px 20px;
  display: block;
  margin: 0 auto;
  pointer-events: auto;
  width: fit-content;
  text-align: center;
  text-decoration: none;
  margin-bottom: 60px;
`;

export const Content = styled.div`
  padding: 60px;
  padding-bottom: 120px;
`;

export const ExtraText = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 20px;
`;

export const Login = styled(Link)`
  color: white;
  pointer-events: auto;
`;

export const Anchor = styled.a`
  color: white;
  pointer-events: auto;
`;
