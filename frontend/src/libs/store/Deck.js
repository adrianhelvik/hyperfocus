import {
  observable,
  computed,
  action,
} from 'mobx'

class Deck {
  @observable title = ''
  @observable cards = []
  @observable color = ''

  constructor(deck) {
    Object.assign(this, deck)
    this.focus = true
  }

  @action addCard(card, index) {
    if (typeof index === 'number' && ! isNaN(index)) {
      this.cards.splice(index, 0, card)
    } else {
      this.cards.push(card)
    }
  }

  @computed get hasCards() {
    return Boolean(this.cards.length)
  }

  @action.bound removeCard(card) {
    if (! this.cards.remove(card))
      console.error('Failed to remove card:', card)
    else
      console.info('Removed card:', card)
  }
}

export default Deck
