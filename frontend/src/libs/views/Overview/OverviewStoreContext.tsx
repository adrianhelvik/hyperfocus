import { createContext } from "react";
import { Board } from "src/libs/types";

export const OverviewStoreContext = createContext({
  onBoardRemoved(_board: Board) {},
  onBoardAdded(_board: Board) {},
  setIsAddingBoard(_input: boolean) {},
  isAddingBoard: false,
  boards: [] as Board[],
});
