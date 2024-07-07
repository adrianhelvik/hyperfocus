import { RouteComponentProps, withRouter } from "react-router-dom";
import { WithAuthProps, withAuth } from "src/libs/authContext";
import * as zIndexes from "src/libs/zIndexes";
import * as theme from "src/libs/theme";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Color from "color";
import React from "react";

const withRouterAny = withRouter as any as <T extends React.ComponentType<any>>(
  component: T
) => T;

type OwnProps = {
  color?: string;
  children?: React.ReactNode;
};

type Props = RouteComponentProps & WithAuthProps & OwnProps;

class Header extends React.Component<Props> {
  render() {
    const isInApp = /^\/(app|board)($|\/)/.test(this.props.match.path);
    const pageColor = this.props.color || theme.ui1;

    return (
      <Container $color={pageColor}>
        <UndecoratedLink to={isInApp ? "/app" : "/"}>
          <Logo pageColor={pageColor} />
        </UndecoratedLink>
        <Children>{this.props.children}</Children>
        {this.props.auth.status === "success" ? (
          this.props.location.pathname === "/" ? (
            <Login to="/login">Go to dashboard</Login>
          ) : (
            <Logout onClick={this.props.auth.logout}>Log out</Logout>
          )
        ) : (
          <Login to="/login">Log in</Login>
        )}
      </Container>
    );
  }
}

export default withRouterAny(
  withAuth(Header)
) as any as React.ComponentType<OwnProps>;

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
  width: 100%;
  position: absolute;
  top: 100%;
  left: 0;
`;

const Login = styled(Link)`
  color: inherit;
`;

const Logout = styled.button`
  color: inherit;
  text-decoration: underline;
  background-color: transparent;
  border: 0;
  cursor: pointer;
`;

const Children = styled.div`
  color: inherit;
  margin-left: 20px;
`;
