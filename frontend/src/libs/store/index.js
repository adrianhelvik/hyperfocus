import { observable, computed, action } from 'mobx'

class Store {
  @observable uncomittedBoards = []
  @observable isAddingBoard = false
  @observable board = null
  @observable boards = []

  @computed get boardsById() {
    const boardsById = observable.map()

    for (const board of this.boards) boardsById.set(board.boardId, board)

    return boardsById
  }

  @action.bound startAddingBoard() {
    this.isAddingBoard = true
  }

  @action.bound stopAddingBoard() {
    this.isAddingBoard = false
  }

  @action.bound addBoard(board) {
    this.uncomittedBoards.push(board)
    this.boards.push(board)
  }

  getBoard(boardId) {
    return this.boardsById.get(boardId)
  }

  @action.bound setBoards(boards) {
    this.boards.replace(boards)
  }

  @action setActiveBoard(board) {
    this.board = board
  }

  @action deleteBoard(boardId) {
    let index = -1
    for (let i = 0; i < this.boards.length; i++) {
      if (this.boards[i].boardId === boardId) {
        index = i
        break
      }
    }
    if (index !== -1) this.boards.splice(index, 1)
  }
}

export default Store
