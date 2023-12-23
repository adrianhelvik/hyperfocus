import { styled, keyframes, css } from "solid-styled-components";
import { createEffect, createSignal } from "solid-js";
import * as zIndexes from "../zIndexes";
import { Dynamic } from "solid-js/web";

type Props = {
    transparent?: boolean;
    hide?: (event?: Event) => void;
    children: any;
    is?: string;
};

const Backdrop = (props: Props) => {
    const [container, setContainer] = createSignal<Element>();

    createEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") props.hide?.(event);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    });

    const onContainerClick = (event: MouseEvent) => {
        if (event.target === container() && typeof props.hide === "function")
            props.hide(event);
    };

    return (
        <Dynamic
            component={props.is ?? "div"}
            class={outerContainer({ transparent: props.transparent })}
            onClick={onContainerClick}
            ref={setContainer}
        >
            <InnerContainer>{props.children}</InnerContainer>
        </Dynamic>
    );
};

export default Backdrop;

const outerContainer = (p: { transparent?: boolean }) => css`
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    z-index: ${String(zIndexes.backdrop)};

    align-items: flex-start;
    display: flex;

    background-color: rgba(0, 0, 0, 0.5);

    animation: ${keyframes`from { opacity: 0; }`} 0.5s;

    ${() =>
        p.transparent
            ? css`
                  background-color: rgba(0, 0, 0, 0.0001);
              `
            : ""}
`;

const InnerContainer = styled.div`
    margin: auto;
`;
