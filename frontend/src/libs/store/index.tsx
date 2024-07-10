import { observable, computed, makeAutoObservable } from "mobx";
import { createContext } from "react";
import Board from "./Board";
import { Project } from "../types";

export const StoreContext = createContext<Store | null>(null);

class Store {
  uncomittedBoards = observable.array<Board>();
  isAddingProject = false;
  isAddingBoard = false;
  board: Board | null = null;
  boards = observable.array<Board>();
  projects = observable.array<Project>();

  constructor() {
    return makeAutoObservable(this);
  }

  @computed get boardsById() {
    const boardsById = observable.map();

    for (const board of this.boards) boardsById.set(board.boardId, board);

    return boardsById;
  }

  setProjects = (projects: Project[]) => {
    this.projects.replace(projects);
  }

  startAddingProject = () => {
    this.isAddingProject = true;
  }

  startAddingBoard = () => {
    this.isAddingBoard = true;
  }

  stopAddingBoard = () => {
    this.isAddingBoard = false;
  }

  addBoard = (board: Board) => {
    this.uncomittedBoards.push(board);
    this.boards.unshift(board);
  }

  getBoard(boardId: string) {
    return this.boardsById.get(boardId);
  }

  setBoards = (boards: Board[]) => {
    this.boards.replace(boards);
  }

  setActiveBoard(board: Board) {
    this.board = board;
  }

  deleteBoard(boardId: string) {
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
