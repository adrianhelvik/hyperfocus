import { createContext } from "react";
import { Board } from "src/libs/types";

export const OverviewStoreContext = createContext({
  onBoardRemoved(_board: Board) { },
  onBoardAdded(_board: Board) { },
  setIsAddingBoard(_input: boolean) { },
  onBoardColorChanged(_boardId: string, _input: string | null) { },
  onBoardTitleChanged(_boardId: string, _name: string) { },
  isAddingBoard: false,
  boards: [] as Board[] | null,
});
