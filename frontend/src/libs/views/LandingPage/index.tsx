import Header from "src/libs/ui/Header";

import {
  GlobalStyle,
  ExtraText,
  Register,
  Content,
  Section,
  Anchor,
  Login,
  Title,
} from "./components";

export default function LandingPage() {
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
          <ExtraText>
            Or <Login to="/login">log in</Login>
          </ExtraText>
          <ExtraText>
            Or check out on{" "}
            <Anchor
              href="https://github.com/adrianhelvik/subtask"
              style={{ pointerEvents: "auto" }}
            >
              GitHub
            </Anchor>
          </ExtraText>
        </Content>
      </Section>
    </>
  );
}
