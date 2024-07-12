import { createContext } from "react";
import { Board } from "src/libs/types";

export const BoardsContext = createContext<Board[]>([]);
