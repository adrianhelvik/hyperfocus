import { WithAuthProps, withAuth } from "authContext";
import Header from "ui/Header";
import React from "react";

import {
    LoginWrapper,
    Particles,
    Register,
    Content,
    Section,
    Login,
    Title,
} from "./components";

type Props = WithAuthProps;

class LandingPage extends React.Component<Props> {
    particles = React.createRef();

    componentDidMount() {
        if ((window as any).particlesJS) {
            (window as any).particlesJS.load(
                "particles-js",
                "particles.json",
                function () {
                    console.log("callback - particles.js config loaded");
                }
            );
        }

        this.props.auth.authenticate();
    }

    render() {
        return (
            <React.Fragment>
                <Particles id="particles-js" />
                <Header />
                <Section>
                    <Content>
                        <Title>
                            <strong>Open source</strong> kanban boards with{" "}
                            <strong>portals</strong>
                        </Title>
                        <Register to="/register">Register</Register>
                        <LoginWrapper>
                            Or <Login to="/login">log in</Login>
                        </LoginWrapper>
                        <LoginWrapper>
                            Or check out on{" "}
                            <a
                                href="https://github.com/adrianhelvik/subtask"
                                style={{ pointerEvents: "auto" }}
                            >
                                GitHub
                            </a>
                        </LoginWrapper>
                    </Content>
                </Section>
            </React.Fragment>
        );
    }
}

export default withAuth(LandingPage);
