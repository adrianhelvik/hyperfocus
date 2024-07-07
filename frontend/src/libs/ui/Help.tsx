import * as zIndexes from "src/libs/zIndexes";
import { createPortal } from "react-dom";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import { useState } from "react";
import React from "react";


type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export default function Help({ children, style }: Props) {
  const [tooltipElement, setTooltipElement] = useState<HTMLElement | null>(null);
  const [iconElement, setIconElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [[x, y], setPos] = useState([0, 0]);

  React.useLayoutEffect(() => {
    if (!open || !iconElement || !tooltipElement) return;

    const iconRect = iconElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    const x = iconRect.right + 10;
    const y = Math.max(
      iconRect.top + iconRect.height / 2 - tooltipRect.height / 2,
      0
    );

    setPos([x, y]);
  }, [iconElement, tooltipElement, open]);

  return (
    <>
      <Icon
        className="material-symbols-outlined"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        ref={setIconElement}
        style={style}
      >
        help
      </Icon>
      {open && (
        createPortal(
          <FloatingHelp
            style={{
              transform: `translateX(${x}px) translateY(${y}px)`,
            }}
            ref={setTooltipElement}
          >
            {children}
          </FloatingHelp>,
          document.body
        )
      )}
    </>
  );
}

const FloatingHelp = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  font-size: 14px;
  padding: 10px;
  box-shadow: ${theme.shadows[1]};
  border-radius: 4px;
  background-color: ${theme.ui1};
  color: white;
  z-index: ${zIndexes.tooltip};

  &,
  & *,
  & *::before,
  & *::after {
    pointer-events: none;
  }
`;

const Icon = styled.span`
  cursor: help;
  &:hover {
    color: ${theme.ui1};
  }
`;
