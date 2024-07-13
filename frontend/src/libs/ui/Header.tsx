import { useLocation } from "react-router-dom";
import { useAuth } from "src/libs/authContext";
import * as zIndexes from "src/libs/zIndexes";
import * as theme from "src/libs/theme";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Color from "color";
import React from "react";
import { useAutoEffect } from "hooks.macro";

type Props = {
  color?: string;
  children?: React.ReactNode;
};

export default function Header(props: Props) {
  const location = useLocation();
  const isInApp = /^\/(app|board)($|\/)/.test(location.pathname);
  const pageColor = props.color || theme.ui1;
  const auth = useAuth();

  useAutoEffect(() => {
    auth.authenticate();
  });

  return (
    <Container $color={pageColor}>
      <UndecoratedLink to={isInApp ? "/app" : "/"}>
        <Logo pageColor={pageColor} />
      </UndecoratedLink>
      <DesktopOnlyTitle>{props.children}</DesktopOnlyTitle>
      {auth.status === "success" && location.pathname === "/" && (
        <Login to="/login">Go to dashboard</Login>
      )}
      {auth.status === "success" && location.pathname === "/app" && (
        <Logout onClick={auth.logout}>Log out</Logout>
      )}
      {auth.status === "failure" && <Login to="/login">Log in</Login>}
    </Container>
  );
}

const UndecoratedLink = styled(Link)`
  text-decoration: none;
`;

const Container = styled.div<{ $color: string }>`
  background-color: ${(p) => p.$color};
  color: ${(p) => (Color(p.$color).isDark() ? "white" : "black")};
  position: sticky;
  top: 0;
  padding: 15px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  z-index: ${zIndexes.header};

  @media (max-width: 800px) {
    grid-template-columns: 1fr auto;
  }
`;

const Logo = ({ pageColor }: { pageColor: string }) => (
  <Logo.Container>
    <Logo.Text1 $pageColor={pageColor}>
      Hyper
      <UnderLine $pageColor={pageColor} />
    </Logo.Text1>
    <Logo.Text2 $pageColor={pageColor}>focus</Logo.Text2>
  </Logo.Container>
);

Logo.Container = styled.div`
  color: inherit;
  font-size: 25px;
  text-transform: uppercase;
  letter-spacing: 4px;
  font-weight: bold;
`;

Logo.Text1 = styled.span<{ $pageColor: string }>`
  color: ${(p) =>
    Color(p.$pageColor).isDark() ? theme.logo1 : theme.logo1Dark};
  position: relative;
`;

Logo.Text2 = styled.span<{ $pageColor: string }>`
  color: ${(p) =>
    Color(p.$pageColor).isDark() ? theme.logo2 : theme.logo2Dark};
`;

const UnderLine = styled.div<{ $pageColor: string }>`
  height: 4px;
  background-color: ${(p) =>
    Color(p.$pageColor).isDark() ? theme.logo1 : theme.logo1Dark};
  width: calc(100% - 3px);
  position: absolute;
  top: 100%;
  left: 0;
`;

const Login = styled(Link)`
  color: inherit;
`;

const Logout = styled.button`
  color: inherit;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  font-size: inherit;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 5px 10px;
  border-radius: 5px;
`;

const DesktopOnlyTitle = styled.div`
  color: inherit;
  margin-left: 20px;

  @media (max-width: 800px) {
    display: none;
  }
`;
