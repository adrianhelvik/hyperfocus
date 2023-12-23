import { createSignal } from "solid-js";
import { Board } from "./types";
import api from "api";

type Action = {
    name: string;
    operation: () => Promise<void>;
};

export const [pendingActions, setPendingActions] = createSignal<Action[]>([]);
export const [isAddingBoard, setIsAddingBoard] = createSignal(false);
export const [boards, setBoards] = createSignal<Board[]>([]);

export const setBoardColor = (boardId: string, color: string) => {
    setBoards((boards) => {
        return boards.map((board) => {
            if (board.boardId !== boardId) return board;
            else
                return {
                    ...board,
                    color,
                };
        });
    });
};

export const stopAddingBoard = () => {
    setIsAddingBoard(false);
};

export const deleteBoard = (boardId: string) => {
    setBoards((boards) => boards.filter((board) => board.boardId !== boardId));

    sync("Delete board", () => api.deleteBoard(boardId));
};

export const createBoard = (board: Board) => {
    setBoards((boards) => [board, ...boards]);

    sync("Create board", () => api.createBoard(board));
};

const sync = (name: string, operation: () => Promise<void>) => {
    setPendingActions((pendingActions) =>
        pendingActions.concat({
            name,
            operation,
        }),
    );
};
