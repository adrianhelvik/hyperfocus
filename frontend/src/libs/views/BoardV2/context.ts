import { createContext, useContext } from "react";
import { Board, BoardChild } from "src/libs/types";

const NOOP = () => {};

export type BoardViewContextType = {
  board: Board | null;
  emitBoardChildAdded(deck: BoardChild): void;
};

export const BoardViewContext = createContext<BoardViewContextType | null>(
  null
);

export function useBoard() {
  return useContext(BoardViewContext)?.board;
}

export function useEmitBoardChildAdded() {
  return useContext(BoardViewContext)?.emitBoardChildAdded || NOOP;
}
