import { createEffect, createSignal } from "solid-js";
import { styled } from "solid-styled-components";
import { Portal } from "solid-js/web";
import * as zIndexes from "zIndexes";
import * as theme from "theme";

export default function Help({
    children,
    iconStyle,
}: {
    children: any;
    iconStyle?: Record<string, any>;
}) {
    const [tooltipElement, setTooltipElement] = createSignal<HTMLElement>();
    const [iconElement, setIconElement] = createSignal<HTMLElement>();
    const [open, setOpen] = createSignal(false);
    const [pos, setPos] = createSignal<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });

    createEffect(() => {
        if (!open || !iconElement() || !tooltipElement()) return;

        const iconRect = iconElement()!.getBoundingClientRect();
        const tooltipRect = tooltipElement()!.getBoundingClientRect();

        const x = iconRect.right + 10;
        const y = Math.max(
            iconRect.top + iconRect.height / 2 - tooltipRect.height / 2,
            0,
        );

        setPos({ x, y });
    });

    return (
        <>
            <Icon
                class="material-symbols-outlined"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                ref={setIconElement}
                style={iconStyle}
            >
                help
            </Icon>
            {open() && (
                <Portal>
                    <FloatingHelp
                        style={{
                            transform: `translateX(${pos().x}px) translateY(${
                                pos().y
                            }px)`,
                        }}
                        ref={setTooltipElement}
                    >
                        {children}
                    </FloatingHelp>
                </Portal>
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
    z-index: ${String(zIndexes.tooltip)};

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
