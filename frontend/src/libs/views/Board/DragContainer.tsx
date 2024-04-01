import {
    ReactNode,
    SetStateAction,
    createContext,
    useMemo,
    useState,
} from "react";

export type Move = {
    targetId: string;
    insetX: number;
    insetY: number;
    clientX: number;
    clientY: number;
    width: number;
    height: number;
};

export const MoveContext = createContext<{
    move: Move | null;
    setMove: React.Dispatch<SetStateAction<Move | null>>;
}>(null);

export default function DragContainer(props: { children: ReactNode }) {
    const [move, setMove] = useState<Move | null>(null);

    const context = useMemo(
        () => ({
            move,
            setMove,
        }),
        [move, setMove]
    );

    return (
        <MoveContext.Provider value={context}>
            <div data-disable-drag>{props.children}</div>
        </MoveContext.Provider>
    );
}
