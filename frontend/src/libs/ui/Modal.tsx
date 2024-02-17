import styled, { css } from "styled-components";
import Backdrop from "./Backdrop";
import { Coord } from "types";
import * as theme from "theme";
import assert from "assert";
import React from "react";

type Props = {
    placement?: Coord;
    hide: () => any;
};

class Modal extends React.Component<Props> {
    render() {
        if (this.props.placement) {
            assert.equal(typeof this.props.placement.x, "number");
            assert.equal(typeof this.props.placement.y, "number");
        }

        if (typeof this.props.hide !== "function")
            throw Error("this.props.hide must be a function");

        return (
            <Backdrop
                is="dialog"
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

const Container = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 4px;
    max-height: 100vh;
    overflow: auto;

    ${(p) =>
        !p.$position &&
        css`
            width: ${(p) => p.$width || 400}px;
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
