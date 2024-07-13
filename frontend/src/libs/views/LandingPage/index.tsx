import { WithAuthProps, withAuth } from "src/libs/authContext";
import Header from "src/libs/ui/Header";
import React from "react";

import {
  LoginWrapper,
  GlobalStyle,
  Register,
  Content,
  Section,
  Anchor,
  Login,
  Title,
} from "./components";
import Color from "color";

type Props = WithAuthProps;

(window as any).Color = Color;

class LandingPage extends React.Component<Props> {
  particles = React.createRef();

  componentDidMount() {
    if ((window as any).particlesJS) {
      (window as any).particlesJS.load(
        "particles-js",
        "particles.json",
        function() {
          console.log("callback - particles.js config loaded");
        }
      );
    }

    this.props.auth.authenticate();
  }

  render() {
    return (
      <>
        <GlobalStyle />
        <Header />
        <Section>
          <Content>
            <Title>
              <strong>Open source</strong> kanban boards with{" "}
              <strong>portals</strong>
            </Title>
            <Register to="/register">Get started</Register>
            <LoginWrapper>
              Or <Login to="/login">log in</Login>
            </LoginWrapper>
            <LoginWrapper>
              Or check out on{" "}
              <Anchor
                href="https://github.com/adrianhelvik/subtask"
                style={{ pointerEvents: "auto" }}
              >
                GitHub
              </Anchor>
            </LoginWrapper>
          </Content>
        </Section>
      </>
    );
  }
}

export default withAuth(LandingPage);
