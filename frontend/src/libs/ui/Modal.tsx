import { styled, css } from "solid-styled-components";
import Backdrop from "./Backdrop";
import * as theme from "theme";
import { Coord } from "types";

type Props = {
    placement?: Coord;
    hide: () => any;
    children: any;
    width?: number;
};

export default function Modal(props: Props) {
    if (typeof props.hide !== "function")
        throw Error("this.props.hide must be a function");

    return (
        <Backdrop
            is="dialog"
            transparent={Boolean(props.placement)}
            hide={props.hide}
        >
            <Container $position={props.placement} $width={props.width}>
                {props.children}
            </Container>
        </Backdrop>
    );
}

const Container = styled("div")<{
    $position?: Coord;
    $width?: number;
}>`
    background-color: white;
    padding: 20px;
    border-radius: 4px;
    max-height: 100vh;
    overflow: auto;

    ${(p) =>
        !p.$position
            ? css`
                  width: ${String(p.$width || 400)}px;
                  margin-bottom: 100px;
              `
            : ""}

    ${(p) =>
        p.$position
            ? css`
                  position: fixed;
                  left: ${String(p.$position.x)}px;
                  top: ${String(p.$position.y + 20)}px;
                  transform: translateX(-50%);
                  box-shadow: ${theme.shadows[1]};
              `
            : ""}
`;
