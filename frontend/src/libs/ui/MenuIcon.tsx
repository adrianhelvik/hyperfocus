import { styled, css } from "solid-styled-components";
import * as theme from "theme";

const MenuIcon = (props: { onClick: (e: any) => void; $dark: boolean }) => (
    <Container>
        <Icon
            data-disable-drag
            class="material-icons"
            $dark={props.$dark}
            onClick={props.onClick}
        >
            menu
        </Icon>
    </Container>
);

const Container = styled.div``;

const Icon = styled("i")<{ $dark: boolean }>`
    transition: background-color 0.3s;
    font-size: 15px;
    background-color: white;
    border-radius: 5px;
    padding: 4px;
    color: #333;
    cursor: pointer;
    box-shadow: ${theme.shadows[0]};
    :active:hover {
        background-color: rgb(200, 200, 200);
    }

    ${(p) =>
        p.$dark
            ? css`
                  background: ${theme.ui1};
                  color: white;
              `
            : ""};
`;

export default MenuIcon;
