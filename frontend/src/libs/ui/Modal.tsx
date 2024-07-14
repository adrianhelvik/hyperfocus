import styled, { css } from "styled-components";
import * as theme from "../theme";
import Backdrop from "./Backdrop";
import { Coord } from "../types";
import React, { ReactNode } from "react";
import { useAutoEffect } from "hooks.macro";

type Props = {
  placement?: Coord | null;
  hide: () => any;
  width?: number | null;
  children: React.ReactNode;
  backdrop?: boolean;
  title?: ReactNode;
};

function Modal(props: Props) {
  if (props.placement) {
    if (typeof props.placement.x !== "number")
      throw Error("props.placement.x must be a number");
    if (typeof props.placement.y !== "number")
      throw Error("props.placement.y must be a number");
  }

  if (typeof props.hide !== "function")
    throw Error("props.hide must be a function");

  useAutoEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        props.hide();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <Backdrop transparent={Boolean(props.placement)} hide={props.hide}>
      <Container $position={props.placement} $width={props.width}>
        {props.title && <Title>{props.title}</Title>}
        {props.children}
      </Container>
    </Backdrop>
  );
}

export default Modal;

const Container = styled.div<{
  $position?: Coord | null;
  $width?: number | null;
}>`
  color: ${theme.modalFg};
  background-color: ${theme.modalBg};
  max-width: calc(100vw - 40px);
  padding: 20px;
  border-radius: 4px;
  max-height: 100vh;
  overflow: auto;
  backdrop-filter: blur(8px);
  box-shadow: ${theme.shadows[1]};

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
    `}
`;

const Title = styled.h2`
  color: ${theme.modalFg};
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 1px;
`;
