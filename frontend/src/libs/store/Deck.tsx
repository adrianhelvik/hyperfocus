import { observable, computed, action } from 'mobx'
import Card from './Card'

type DeckParam = {
  title?: string
  cards?: Card[]
}

class Deck {
  @observable title = ''
  @observable cards = observable.array<Card>()
  @observable color = ''
  focus = true

  constructor(deck: DeckParam) {
    Object.assign(this, deck)
  }

  @action addCard(card: Card, index: number) {
    if (typeof index === 'number' && !isNaN(index)) {
      this.cards.splice(index, 0, card)
    } else {
      this.cards.push(card)
    }
  }

  @computed get hasCards() {
    return Boolean(this.cards.length)
  }

  @action.bound removeCard(card: Card) {
    if (!this.cards.remove(card)) console.error('Failed to remove card:', card)
    else console.info('Removed card:', card)
  }
}

export default Deck
