import {
    ReactNode,
    useContext,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { MoveContext } from "./DragContainer";

export default function Draggable(props: {
    targetId: string;
    children: ReactNode;
    onDrop: (e: MouseEvent) => void;
}) {
    const [cloneRoot] = useState<HTMLDivElement>(() =>
        document.createElement("div")
    );
    const [realRoot, setRealRoot] = useState<HTMLDivElement | null>(null);
    const { move, setMove } = useContext(MoveContext);
    const isMoving = move != null && move.targetId === props.targetId;

    const onDropRef = useRef<(e: MouseEvent) => void>(props.onDrop);
    onDropRef.current = props.onDrop;

    useLayoutEffect(() => {
        document.body.append(cloneRoot);
        return () => {
            cloneRoot.remove();
        };
    }, [cloneRoot]);

    useLayoutEffect(() => {
        if (!realRoot) return;

        let rect: DOMRect;

        let startCoord = { clientX: 0, clientY: 0 };
        let started = false;

        const onMouseDown = (event: MouseEvent) => {
            startCoord = { clientX: event.clientX, clientY: event.clientY };
            started = false;
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };

        const onMouseMove = (event: MouseEvent) => {
            if (started) {
                setMove((move) => ({
                    ...move,
                    clientX: event.clientX,
                    clientY: event.clientY,
                }));
            } else if (
                distance(
                    startCoord.clientX,
                    startCoord.clientY,
                    event.clientX,
                    event.clientY
                ) > 5
            ) {
                rect = realRoot.getBoundingClientRect();
                started = true;
                setMove({
                    targetId: props.targetId,
                    insetX: event.clientX - rect.left,
                    insetY: event.clientY - rect.top,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    width: rect.width,
                    height: rect.height,
                });
            }
        };

        const onMouseUp = (event: MouseEvent) => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            if (!started) return;
            setMove(null);
            onDropRef.current(event);
        };

        realRoot.addEventListener("mousedown", onMouseDown);

        return () => {
            realRoot.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
    }, [realRoot, props.targetId, setMove]);

    if (isMoving) {
        const x = move.clientX - move.insetX;
        const y = move.clientY - move.insetY;

        var clone = (
            <>
                {createPortal(
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: move.width,
                            height: move.height,
                            transform: `translateX(${x}px) translateY(${y}px)`,
                            zIndex: 1000,
                        }}
                    >
                        {props.children}
                    </div>,
                    cloneRoot
                )}
            </>
        );
    }

    return (
        <div
            ref={setRealRoot}
            style={{
                opacity: isMoving ? 0 : 1,
            }}
        >
            {props.children}
            {clone}
        </div>
    );
}

function distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
