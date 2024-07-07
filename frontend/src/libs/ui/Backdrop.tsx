import styled, { keyframes, css } from "styled-components";
import React, { useEffect, useState } from "react";
import * as zIndexes from "../zIndexes";

type Props = {
  transparent?: boolean;
  hide: (event?: React.MouseEvent | KeyboardEvent) => void;
  children: JSX.Element;
};

const Backdrop = ({ hide, transparent, children }: Props) => {
  const [container, setContainer] = useState<Element | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") hide(event);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [hide]);

  const onContainerClick = (event: React.MouseEvent) => {
    if (event.target === container && typeof hide === "function") hide(event);
  };

  return (
    <OuterContainer
      $transparent={transparent}
      onClick={onContainerClick}
      ref={setContainer}
    >
      <InnerContainer>{children}</InnerContainer>
    </OuterContainer>
  );
};

export default Backdrop;

const OuterContainer = styled.div<{ $transparent?: boolean }>`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
  z-index: ${zIndexes.backdrop};

  align-items: flex-start;
  display: flex;

  background-color: rgba(0, 0, 0, 0.5);

  animation: ${keyframes`from { opacity: 0; }`} 0.5s;

  ${(p) =>
    p.$transparent &&
    css`
      background-color: rgba(0, 0, 0, 0.0001);
    `}
`;

const InnerContainer = styled.div`
  margin: auto;
`;
