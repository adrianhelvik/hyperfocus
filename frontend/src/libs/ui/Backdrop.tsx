import styled, { keyframes, css } from "styled-components";
import * as zIndexes from "../zIndexes";
import React from "react";

type Props = {
    transparent?: boolean;
    hide: (event?: Event) => void;
    children: JSX.Element;
};

const Backdrop: React.FC<Props> = ({ hide, transparent, children }) => {
    const [container, setContainer] = React.useState<Element>();

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.which === 27) hide(event);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    const onContainerClick = (event: MouseEvent) => {
        if (event.target === container && typeof hide === "function")
            hide(event);
    };

    return (
        <OuterContainer
            transparent={transparent}
            onClick={onContainerClick}
            ref={setContainer}
        >
            <InnerContainer>{children}</InnerContainer>
        </OuterContainer>
    );
};

export default Backdrop;

const OuterContainer = styled.div<any>`
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
        p.transparent &&
        css`
            background-color: rgba(0, 0, 0, 0.0001);
        `}
`;

const InnerContainer = styled.div`
    margin: auto;
`;
