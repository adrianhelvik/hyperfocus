import { useAutoEffect, useAutoLayoutEffect } from "hooks.macro";
import React, { ReactNode, useState } from "react";
import styled, { css } from "styled-components";
import * as theme from "../theme";
import Backdrop from "./Backdrop";
import { Coord } from "../types";

type Props = {
  placement?: Coord | null;
  hide: () => any;
  width?: number | null;
  children: React.ReactNode;
  backdrop?: boolean;
  title?: ReactNode;
};

function Modal(props: Props) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [offsetX, setOffsetX] = useState<number>(0);

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

  useAutoLayoutEffect(() => {
    if (!container) return;
    if (!props.placement) return;

    const placeElement = () => {
      const rect = container.getBoundingClientRect();
      if (rect.left + rect.width > window.innerWidth) {
        setOffsetX(-rect.width);
      }
    };

    placeElement();

    window.addEventListener("resize", placeElement);
    const interval = setInterval(placeElement, 500);

    return () => {
      window.removeEventListener("resize", placeElement);
      clearInterval(interval);
    };
  });

  return (
    <Backdrop transparent={Boolean(props.placement)} hide={props.hide}>
      <Container $placement={props.placement} $width={props.width} ref={setContainer} $offsetX={offsetX}>
        {props.title && <Title>{props.title}</Title>}
        {props.children}
      </Container>
    </Backdrop>
  );
}

export default Modal;

const Container = styled.div<{
  $placement?: Coord | null;
  $width?: number | null;
  $offsetX: number;
}>`
  color: white;
  background-color: ${theme.modalBg};
  max-width: calc(100vw - 40px);
  padding: 20px;
  border-radius: 4px;
  max-height: 100vh;
  overflow: auto;
  box-shadow: ${theme.shadows[1]};

  ${(p) =>
    !p.$placement &&
    css`
      width: ${p.$width || 400}px;
      margin-bottom: 100px;
    `}

  ${(p) =>
    p.$placement &&
    css`
      position: fixed;
      left: ${p.$placement.x + p.$offsetX}px;
      top: ${p.$placement.y}px;
    `}
`;

const Title = styled.h2`
  color: white;
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 1px;
`;
