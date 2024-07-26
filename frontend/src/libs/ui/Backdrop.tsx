import React, { ReactNode, useState } from "react";
import styled, { css } from "styled-components";
import { cssFilter } from "src/util/css";
import * as zIndexes from "../zIndexes";
import Color from "color";

type Props = {
  transparent?: boolean;
  hide: (event?: React.MouseEvent | KeyboardEvent) => void;
  children: ReactNode;
  blur?: boolean;
};

const Backdrop = (props: Props) => {
  const [container, setContainer] = useState<Element | null>(null);

  const onContainerClick = (event: React.MouseEvent) => {
    if (event.target === container && typeof props.hide === "function") props.hide(event);
  };

  return (
    <OuterContainer
      $transparent={props.transparent}
      $blur={props.blur}
      onClick={onContainerClick}
      ref={setContainer}
    >
      <InnerContainer>{props.children}</InnerContainer>
    </OuterContainer>
  );
};

export default Backdrop;

const OuterContainer = styled.div<{ $transparent?: boolean, $blur?: boolean }>`
  position: fixed;
  inset: 0;

  z-index: ${zIndexes.backdrop};

  align-items: flex-start;
  display: flex;

  ${p => p.$blur && css`
    ${cssFilter("blur(2px) grayscale(0.4) brightness(30%)")}
  `}

  ${p => !p.$transparent && css`
    background-color: ${Color("black").alpha(0.4).string()};
  `}
`;

const InnerContainer = styled.div`
  margin: auto;
`;
