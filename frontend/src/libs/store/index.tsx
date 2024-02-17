import { observable, computed, action } from "mobx";
import Board from "./Board";

class Store {
    @observable uncomittedBoards = observable.array<Board>();
    @observable isAddingBoard = false;
    @observable board: Board | null = null;
    @observable boards = observable.array<Board>();

    @computed get boardsById() {
        const boardsById = observable.map();

        for (const board of this.boards) boardsById.set(board.boardId, board);

        return boardsById;
    }

    @action.bound startAddingBoard() {
        this.isAddingBoard = true;
    }

    @action.bound stopAddingBoard() {
        this.isAddingBoard = false;
    }

    @action.bound addBoard(board: Board) {
        this.uncomittedBoards.push(board);
        this.boards.unshift(board);
    }

    getBoard(boardId: string) {
        return this.boardsById.get(boardId);
    }

    @action.bound setBoards(boards: Board[]) {
        this.boards.replace(boards);
    }

    @action setActiveBoard(board: Board) {
        this.board = board;
    }

    @action deleteBoard(boardId: string) {
        let index = -1;
        for (let i = 0; i < this.boards.length; i++) {
            if (this.boards[i].boardId === boardId) {
                index = i;
                break;
            }
        }
        if (index !== -1) this.boards.splice(index, 1);
    }
}

export default Store;
