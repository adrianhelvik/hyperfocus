import styled, { css } from "styled-components";
import MenuIcon from "ui/MenuIcon";
import * as theme from "theme";
import Color from "color";
import { Project } from "src/libs/types";

type Props = {
    isSelected: boolean;
    project?: Project;
};

export default function ProjectTile(props: Props) {
    const openMenu = () => {};

    return (
        <Container
            $color={props.project?.color || "white"}
            $isSelected={props.isSelected}
            onContextMenu={openMenu}
        >
            <Title>{props.project?.title || <Weak>Untitled</Weak>}</Title>
            <MenuIcon $dark={!props.project?.color} onClick={openMenu} />
        </Container>
    );
}

const Container = styled.div<{ $color: string; $isSelected: boolean }>`
    cursor: pointer;
    padding: 10px;
    background: ${(p) => p.$color};
    color: ${(p) =>
        Color(p.$color).blacken(0.7).isDark() ? "white" : "black"};
    border-radius: 4px;
    margin-right: 10px;
    margin-bottom: 10px;
    position: relative;
    display: inline-flex;
    box-shadow: ${theme.shadows[0]};
    transition: box-shadow 0.3s;
    height: 80px;

    ${(p) =>
        p.$isSelected &&
        css`
            outline: 2px solid ${theme.ui1};
            outline-offset: -2px;
        `}

    :hover {
        box-shadow: ${theme.shadows[1]};
    }
`;

const Title = styled.div`
    overflow: hidden;
    width: 100%;
`;

const Weak = styled.span`
    color: ${theme.placeholderGray};
`;
