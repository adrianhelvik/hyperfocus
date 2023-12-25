import { createMemo, createSignal } from "solid-js";
import { Board } from "./types";
import api from "api";
import { Deck } from "./types";

type Action = {
    name: string;
    operation: () => Promise<void>;
};

export const [pendingActions, setPendingActions] = createSignal<Action[]>([]);
export const [isAddingBoard, setIsAddingBoard] = createSignal(false);
export const [boards, setBoards] = createSignal<Board[]>([]);

export const patchDeck = (_deckId: string, _patch: Partial<Deck>) => {
    // TODO
};

export const setBoardColor = (boardId: string, color: string) => {
    const board = boards().find((board) => board.boardId === boardId)!;
    board.setColor(color);
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
