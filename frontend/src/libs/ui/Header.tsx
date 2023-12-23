import styles from "./Header.module.css";
import { createMemo } from "solid-js";
import * as theme from "../theme";
import Color from "color";
import auth from "auth";

export default function Header(props: {
    color?: string;
    children?: string | HTMLElement;
}) {
    // TODO: Make reactive
    const isInApp = createMemo(() =>
        /^\/(app|board)($|\/)/.test(location.pathname),
    );
    const pageColor = props.color || theme.ui1;

    return (
        <div
            style={{
                "--page-color": pageColor,
                "--page-text-color": Color(pageColor).isDark()
                    ? "white"
                    : "black",
                "--logo-text1": Color(pageColor).isDark()
                    ? theme.logo1
                    : theme.logo1Dark,
            }}
            class={styles.container}
        >
            <a href={isInApp() ? "/app" : "/"} class={styles.logoContainer}>
                <span class={styles.logoText1}>
                    sub
                    <div class={styles.logoUnderline} />
                </span>
                <span class={styles.logoText2}>task</span>
            </a>
            <div class={styles.children}>{props.children}</div>
            {auth.status === "success" ? (
                location.pathname === "/" ? (
                    <a class={styles.login} href="/login">
                        Go to dashboard
                    </a>
                ) : (
                    <button type="button" onClick={auth.logout}>
                        Log out
                    </button>
                )
            ) : (
                <a class={styles.login} href="/login">
                    Log in
                </a>
            )}
        </div>
    );
}

/*
const Container = styled.div`
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

const Logo = ({ pageColor }) => (
    <Logo.Container>
        <Logo.Text1 $pageColor={pageColor}>
            sub
            <UnderLine $pageColor={pageColor} />
        </Logo.Text1>
        <Logo.Text2 $pageColor={pageColor}>task</Logo.Text2>
    </Logo.Container>
);

Logo.Container = styled.div`
    color: inherit;
    font-size: 25px;
    text-transform: uppercase;
    letter-spacing: 4px;
    font-weight: bold;
`;

Logo.Text1 = styled.span`
    color: ${(p) =>
        Color(p.$pageColor).isDark() ? theme.logo1 : theme.logo1Dark};
    position: relative;
`;

Logo.Text2 = styled.span`
    color: ${(p) =>
        Color(p.$pageColor).isDark() ? theme.logo2 : theme.logo2Dark};
`;

const UnderLine = styled.div`
    height: 4px;
    background-color: ${(p) =>
        Color(p.$pageColor).isDark() ? theme.logo1 : theme.logo1Dark};
    width: 61px;
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
*/
