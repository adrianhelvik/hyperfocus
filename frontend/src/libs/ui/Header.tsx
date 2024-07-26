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
  const pageColor = "black";
  const auth = useAuth();

  useAutoEffect(() => {
    auth.authenticate().then(console.log.bind(console, "Auth result"));
  });

  console.log("Auth status:", auth.status);

  return (
    <Container $color={pageColor}>
      <UndecoratedLink to={isInApp ? "/app" : "/"}>
        <Logo pageColor={pageColor} />
      </UndecoratedLink>
      {auth.role === "admin" && location.pathname !== "/admin" && <AdminLink to="/admin">Admin</AdminLink>}
      {location.pathname === "/admin" && <AdminLink to="/app">Dashboard</AdminLink>}
      <Content>{props.children}</Content>
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
  background-color: transparent;
  color: white;
  position: sticky;
  top: 0;
  padding: 15px;
  display: grid;
  grid-template-columns: 1fr repeat(10, auto);
  align-items: center;
  z-index: ${zIndexes.header};

  @media (max-width: 800px) {
    grid-template-columns: 1fr auto;
  }
`;

export const Logo = ({ pageColor }: { pageColor: string }) => (
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
    Color(p.$pageColor).isDark() ? theme.baseColor : theme.logo1Dark};
  position: relative;
`;

Logo.Text2 = styled.span<{ $pageColor: string }>`
  color: ${(p) =>
    Color(p.$pageColor).isDark() ? theme.useWhiteInstead : theme.logo2Dark};
`;

const UnderLine = styled.div<{ $pageColor: string }>`
  height: 4px;
  background-color: ${(p) =>
    Color(p.$pageColor).isDark() ? theme.baseColor : theme.logo1Dark};
  width: calc(100% - 4px);
  position: absolute;
  top: 100%;
  left: 0;
`;

const AdminLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

const Login = styled(Link)`
  color: inherit;
  margin-left: auto;
`;

const Logout = styled.button`
  color: inherit;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  font-size: inherit;
  padding: 8px 20px;
  border-radius: 5px;
  transition: background-color 300ms;
  margin-left: auto;

  &:hover {
    background-color: ${Color(theme.baseColor).mix(Color("#000"), 0.6).hex()};
  }
`;

const Content = styled.div`
  color: white;
  margin-left: 20px;
`;
