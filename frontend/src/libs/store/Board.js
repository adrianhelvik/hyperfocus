import arrayMove from 'util/arrayMove'
import { v4 as uuid } from 'uuid'
import Portal from './Portal'
import Deck from './Deck'

import {
  observable,
  computed,
  action,
} from 'mobx'

class Board {
  @observable title = ''
  @observable children = []
  @observable boardId = null

  constructor(arg) {
    if (typeof arg === 'string')
      return this.fromTitle(arg)
    else
      return this.fromBoard(arg)
  }

  fromBoard(board) {
    this.title = board.title
    this.children.replace(board.children)
    this.boardId = board.boardId
  }

  fromTitle(title) {
    this.title = title
    this.boardId = uuid()
  }

  @computed get decks() {
    return this.children
      .filter(x => x instanceof Deck)
  }

  @computed get portals() {
    return this.children
      .filter(x => x instanceof Portal)
  }

  @computed get decksById() {
    const decksById = observable.map()

    for (const deck of this.decks)
      decksById.set(deck.deckId, deck)

    return decksById
  }

  @action addDeck(deck, index) {
    if (typeof index === 'number')
      this.children.splice(index, 0, deck)
    else
      this.children.push(deck)
  }

  @action addPortal(title, deck) {
    const portal = new Portal(title, deck)
    this.children.push(portal)
    return portal
  }

  @action move(fromIndex, toIndex) {
    arrayMove(this.children, fromIndex, toIndex)
  }
}

export default Board
