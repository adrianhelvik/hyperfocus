import { Portal as _Portal } from "react-portal";
import * as zIndexes from "src/libs/zIndexes";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import { useState } from "react";
import React from "react";

// XXX: Incorrect typings
const Portal = _Portal as any;

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export default function Help({ children, style }: Props) {
  const [tooltipElement, setTooltipElement] = useState<HTMLElement>();
  const [iconElement, setIconElement] = useState<HTMLElement>();
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
    <React.Fragment>
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
        <Portal>
          <FloatingHelp
            style={{
              transform: `translateX(${x}px) translateY(${y}px)`,
            }}
            ref={setTooltipElement}
          >
            {children}
          </FloatingHelp>
        </Portal>
      )}
    </React.Fragment>
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
  :hover {
    color: ${theme.ui1};
  }
`;
