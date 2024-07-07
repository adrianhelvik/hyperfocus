import { StoreContext } from "src/libs/store";
import { useContext, useEffect } from "react";
import { reaction } from "mobx";
import api from "src/libs/api";

export default function Reactions(props: { children?: React.ReactNode }) {
  const store = useContext(StoreContext)!;

  useEffect(() => {
    const dispose = reaction(
      () => store.uncomittedBoards.length,
      (pendingBoards) => {
        if (!pendingBoards) return;

        const uncomittedBoards = store.uncomittedBoards.slice();
        store.uncomittedBoards.replace([]);

        for (const board of uncomittedBoards) {
          api.createBoard(board).catch((e: Error) => {
            console.error("Failed to create board:", board);
            for (let i = 0; i < store.boards.length; i++) {
              if (store.boards[i].boardId === board.boardId) {
                store.boards.splice(i, 1);
                break;
              }
            }
            setTimeout(() => {
              alert(e.message);
            }, 100);
          });
        }
      }
    );

    return () => {
      dispose();
    };
  }, [])

  return <>{props.children}</>
}
