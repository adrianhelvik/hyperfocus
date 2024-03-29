import styled, { css } from "styled-components";
import { Coord } from "src/libs/types";
import * as theme from "src/libs/theme";
import Backdrop from "./Backdrop";
import React from "react";

type Props = {
    placement?: Coord;
    hide: () => any;
    width?: number;
    children: React.ReactNode;
    backdrop?: boolean;
};

class Modal extends React.Component<Props> {
    render() {
        if (this.props.placement) {
            if (typeof this.props.placement.x !== "number")
                throw Error("this.props.placement.x must be a number");
            if (typeof this.props.placement.y !== "number")
                throw Error("this.props.placement.y must be a number");
        }

        if (typeof this.props.hide !== "function")
            throw Error("this.props.hide must be a function");

        return (
            <Backdrop
                transparent={Boolean(this.props.placement)}
                hide={this.props.hide}
            >
                <Container
                    $position={this.props.placement}
                    $width={this.props.width}
                >
                    {this.props.children}
                </Container>
            </Backdrop>
        );
    }
}

export default Modal;

const Container = styled.div<{
    $position?: Coord;
    $width?: number;
}>`
    background-color: white;
    padding: 20px;
    border-radius: 4px;
    max-height: 100vh;
    overflow: auto;

    ${(p) =>
        !p.$position &&
        css`
            width: ${p.$width || 400}px;
            margin-bottom: 100px;
        `}

    ${(p) =>
        p.$position &&
        css`
            position: fixed;
            left: ${p.$position.x}px;
            top: ${p.$position.y + 20}px;
            transform: translateX(-50%);
            box-shadow: ${theme.shadows[1]};
        `}
`;
