import { styled, keyframes, css } from "solid-styled-components";
import { createEffect, createSignal, onCleanup } from "solid-js";
import * as theme from "theme";
import useEventManager from "useEventManager";

function AddCircle(props: { children: any }) {
    const [container, setContainer] = createSignal<HTMLElement>();
    const [mounted, setMounted] = createSignal(false);
    const [open, setOpen] = createSignal(false);
    const { on } = useEventManager();

    const onDocumentClick = (event: MouseEvent) => {
        if (container()!.contains(event.target as any)) {
            return;
        }

        setOpen(false);
    };

    createEffect(() => {
        const timeout = setTimeout(() => {
            setMounted(true);
        }, 400);

        onCleanup(() => {
            clearTimeout(timeout);
        });

        on(document, "click", onDocumentClick);
    });

    return (
        <Container
            onClick={() => setOpen(!open())}
            ref={setContainer}
            $mounted={mounted()}
            $open={open()}
        >
            <Content $open={open()} $mounted={mounted()}>
                {props.children}
            </Content>
            <VerticalLine $mounted={mounted()} $open={open()} />
            <HorizontalLine $mounted={mounted()} $open={open()} />
        </Container>
    );
}

export default AddCircle;

const diameter = 60 as any;
const height = 110 as any;
const width = 200 as any;

const Container = styled.div<{ $mounted: any; $open: any }>`
    background-color: ${theme.ui1};
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: ${diameter}px;
    height: ${diameter}px;
    text-align: center;
    border-radius: ${diameter}px;
    animation: ${(p) => (p.$open ? openAnimation : closeAnimation)}
        ${(p) => (p.$mounted ? ".3s" : "0s")};
    animation-fill-mode: forwards;
    cursor: pointer;
`;

const stage1 = css`
    border-radius: ${diameter};
    bottom: 20px;
    right: 20px;
    width: ${diameter}px;
`;

const stage2 = css`
    border-radius: 0;
    border-top-left-radius: 4px;
    bottom: 0px;
    right: 0px;
    width: ${width}px;
`;

const stage3 = css`
    height: ${height}px;
    width: ${width}px;
    bottom: 0px;
    right: 0px;
    border-radius: 0;
    border-top-left-radius: 4px;
`;

const openAnimation = keyframes`
  0% {
    ${stage1}
  }
  50% {
    ${stage2}
  }
  100% {
    ${stage3}
  }
`;

const closeAnimation = keyframes`
  0% {
    ${stage3}
  }
  50% {
    ${stage2}
  }
  100% {
    ${stage1}
  }
`;

const lineHeight: any = 20;
const lineWidth: any = 3;

const Line = styled.div<{ $open: any; $mounted: any }>`
    background: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    pointer-events: none;
    animation: ${(p) => (p.$open ? lineOpen : lineClosed)}
        ${(p) => (p.$mounted ? ".3s" : "0s")};
    animation-fill-mode: forwards;
`;

const lineOpen = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const lineClosed = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const VerticalLine = styled(Line)`
    width: ${lineWidth}px;
    height: ${lineHeight}px;
`;

const HorizontalLine = styled(Line)`
    width: ${lineHeight}px;
    height: ${lineWidth}px;
`;

const Content = styled.div<{ $mounted: any; $open: any }>`
    transition: 0.3s;
    opacity: ${(p) => p.$open || 0};
    pointer-events: ${(p) => (!p.$open ? "none" : "")};
`;
