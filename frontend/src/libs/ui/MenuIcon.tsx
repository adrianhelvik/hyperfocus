import styled, { css } from "styled-components";
import * as theme from "theme";
import React from "react";

const MenuIcon = ({ onClick, $dark }) => (
    <Container>
        <Icon
            data-disable-drag
            className="material-icons"
            $dark={$dark}
            onClick={onClick}
        >
            menu
        </Icon>
    </Container>
);

const Container = styled.div``;

const Icon = styled.i`
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
        p.$dark &&
        css`
            background: ${theme.ui1};
            color: white;
        `};
`;

export default MenuIcon;
