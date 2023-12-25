import { styled, css } from "solid-styled-components";
import confirmInPlace from "confirmInPlace";
import someParent from "util/someParent";
import * as zIndexes from "zIndexes";
import Button from "ui/Button";
import * as theme from "theme";
import { batch, createMemo, createSignal } from "solid-js";
import useEventManager from "useEventManager";
import { Portal } from "solid-js/web";

function getLastHoverIndex() {}

export default function Card(props: any) {
    const [element, setElement] = createSignal<HTMLElement>();
    const [removeElement, setRemoveElement] = createSignal<HTMLElement>();

    const [initialClientX, setInitialClientX] = createSignal<number | null>(
        null,
    );
    const [initialClientY, setInitialClientY] = createSignal<number | null>(
        null,
    );
    const [clientX, setClientX] = createSignal<number | null>(null);
    const [clientY, setClientY] = createSignal<number | null>(null);
    const [moving, setMoving] = createSignal(false);
    const [width, setWidth] = createSignal<number | null>(null);
    const [height, setHeight] = createSignal<number | null>(null);

    const { on, off } = useEventManager();

    const onMouseDown = (event: MouseEvent) => {
        event.stopPropagation();
        const { target, clientX, clientY } = event;

        if (removeElement()!.contains(target as any)) {
            remove(event);
            return;
        }

        // extract values
        setInitialClientX(clientX);
        setClientX(clientX);
        setInitialClientY(clientY);
        setClientY(clientY);
        setWidth(element()!.offsetWidth);
        setHeight(element()!.offsetHeight);

        // start moving
        setMoving(true);
        props.setHoverIndex(props.index);

        on(document, "mousemove", (event: MouseEvent) => {
            setClientX(event.clientX);
            setClientY(event.clientY);
        });

        on(document, "mouseup", (event: MouseEvent) => {
            setMoving(false);
            props.setMoving(false);
            const { clientX, clientY } = event;
            const target = document.elementFromPoint(clientX, clientY);

            props.setHoverIndex(null);
            const element = someParent(target, (e: HTMLElement) => {
                return elementToDeck.has(e);
            });
            const otherDeckComponent = elementToDeck.get(element);

            if (otherDeckComponent) {
                const otherDeck = otherDeckComponent.props.deck;
                const index = getLastHoverIndex();

                // TODO: Move card
            }

            off(document, "mousemove");
            off(document, "mouseup");
            batch(() => {
                setClientX(clientX);
                setClientY(0);
                setInitialClientX(0);
                setInitialClientY(0);
            });
        });
    };

    const style = createMemo(() => {
        if (moving())
            return {
                top: clientY(),
                left: clientX(),
                width: width(),
                height: height(),
                transform: `translateX(${this.insetX}px) translateY(${this.insetY}px)`,
            };
        return {};
    });

    const deltaX = () => {
        return clientX() - initialClientX();
    };

    const deltaY = () => {
        return clientY() - initialClientY();
    };

    const remove = async (event: MouseEvent) => {
        if (
            !(await confirmInPlace(event, (p: any) => (
                <div>
                    <div>Delete card?</div>
                    <div style={{ display: "flex", gap: 20 } as any}>
                        <Button $gray onClick={p.no}>
                            Cancel
                        </Button>
                        <Button $danger onClick={p.yes}>
                            Delete it
                        </Button>
                    </div>
                </div>
            )))
        )
            return;
        // TODO: Remove card
    };

    const template = () => {
        return (
            <Container
                data-card={props.index}
                ref={setElement}
                class={props.class}
                onMouseDown={onMouseDown}
                noPointer={this.noPointer}
                index={this.props.index}
                moving={this.moving}
                style={this.style}
            >
                {Boolean(this.moving) && (
                    <style>{`body { user-select: none }`}</style>
                )}
                <Title>{this.props.card.title}</Title>
                <Remove ref={(e) => (this.removeElement = e)}>
                    <span className="material-symbols-outlined">delete</span>
                </Remove>
            </Container>
        );
    };

    const placeholder = () => {
        if (!moving()) return null;

        return (
            <div
                data-card-placeholder={props.index}
                style={{
                    width: props.placeholderWidth,
                    height: props.placeholderHeight,
                }}
            />
        );
    };

    return (
        <>
            {props.hoverIndex === props.index && placeholder()}
            {moving() ? template() : <Portal>{template()}</Portal>}
        </>
    );
}

const Container = styled.div<{ $moving: any; $index: any }>`
    display: flex;
    background: white;
    position: ${(p) => (p.$moving ? "fixed" : "relative")};
    transition: box-shadow 0.3s;
    z-index: ${(p) => (p.$moving ? zIndexes.moving : zIndexes.movable)};
    ${(p) =>
        p.$moving &&
        css`
            pointer-events: none;
        `};
    ${(p) =>
        p.$moving &&
        css`
            box-shadow: ${theme.shadows[1]};
        `};
    cursor: move;
    ::after {
        content: ${(p) => String(p.$index)};
    }
`;

const Title = styled.div`
    white-space: pre-line;
    flex-grow: 1;
`;

const Remove = styled.div`
    background: ${theme.red};
    width: 20px;
    height: 20px;
    text-align: center;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    flex-grow: 0;
    align-self: flex-start;
    display: flex;
    align-items: center;
    justify-content: center;
    & > span {
        font-size: 14px;
    }

    transition: opacity 0.3s;
    opacity: 0;

    [data-card]:hover & {
        opacity: 1;
    }
`;
