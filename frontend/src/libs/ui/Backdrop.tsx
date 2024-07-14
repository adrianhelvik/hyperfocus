import styled, { css } from "styled-components";
import React, { ReactNode, useState } from "react";
import * as theme from "src/libs/theme";
import * as zIndexes from "../zIndexes";

type Props = {
  transparent?: boolean;
  hide: (event?: React.MouseEvent | KeyboardEvent) => void;
  children: ReactNode;
};

const Backdrop = ({ hide, transparent, children }: Props) => {
  const [container, setContainer] = useState<Element | null>(null);

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

  background-color: ${theme.modalBackdropColor};
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);

  ${(p) =>
    p.$transparent &&
    css`
      background-color: rgba(0, 0, 0, 0.0001);
    `}
`;

const InnerContainer = styled.div`
  margin: auto;
`;
