import styled from "styled-components";
import { Portal } from "react-portal";
import * as zIndexes from "zIndexes";
import { useState } from "react";
import * as theme from "theme";
import React from "react";

export default function Help({ children, style }) {
    const [tooltipElement, setTooltipElement] = useState();
    const [iconElement, setIconElement] = useState();
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
