import { useState, useEffect } from "react"
import BoardView from "./BoardView";
import { useParams } from "react-router-dom";

export default function BoardV2() {
    const { boardId } = useParams<{ boardId: string }>();
    const [div, setDiv] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!div) return;

        const boardView = new BoardView(div, boardId);

        return () => boardView.unmount();
    }, [div, boardId]);

    return <div ref={setDiv} />
}
