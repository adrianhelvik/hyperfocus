import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Board } from "./types";
import sleep from "./sleep";
import api from "./api";

const LoadBoardsContext = createContext<() => void>(() => { });
const SetBoardsContext = createContext<React.Dispatch<React.SetStateAction<Board[] | null>>>(() => { });
const BoardsContext = createContext<Board[] | null>(null);

export function useBoardState() {
  return [useContext(BoardsContext), useContext(SetBoardsContext)] as const;
}

export function useLoadBoards() {
  const loadBoards = useContext(LoadBoardsContext);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);
}

export default function BoardsController(props: { children: ReactNode }) {
  const [reloadCount, setReloadCount] = useState(0);
  const [boards, setBoards] = useState<Board[] | null>(null);

  useEffect(() => {
    if (!reloadCount) return;
    let cancelled = false;
    const minimumWaitPromise = sleep(500);
    api.ownBoards().then(async ({ boards }) => {
      await minimumWaitPromise;
      if (cancelled) return;
      setBoards(boards);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const loadBoards = useCallback(() => {
    setReloadCount(it => it + 1);
  }, [])

  return (
    <LoadBoardsContext.Provider value={loadBoards}>
      <BoardsContext.Provider value={boards}>
        <SetBoardsContext.Provider value={setBoards}>
          {props.children}
        </SetBoardsContext.Provider>
      </BoardsContext.Provider>
    </LoadBoardsContext.Provider>
  );
}
