import { observable, computed, action } from "mobx";
import Portal from "./Portal";
import Card from "./Card";

export type DeckParam = {
  boardId?: string;
  deckId: string;
  index?: number;
  target?: Deck;
  title?: string;
  cards?: Card[];
  portalId?: string;
  portals?: unknown[];
  children?: (Card | Portal)[];
  type?: "deck";
};

class Deck {
  @observable title = "";
  @observable cards = observable.array<Card>();
  @observable color = "";
  focus = true;
  deckId: string;
  initialFocus?: boolean;

  type? = "deck" as const;
  referencedByPortal?: boolean;
  boardTitle?: string;
  portals?: Portal[];

  constructor(deck: DeckParam) {
    Object.assign(this, deck);
    this.deckId = deck.deckId;
  }

  @action addCard(card: Card, index?: number) {
    if (typeof index === "number" && !isNaN(index)) {
      this.cards.splice(index, 0, card);
    } else {
      this.cards.push(card);
    }
  }

  @computed get hasCards() {
    return Boolean(this.cards.length);
  }

  @action.bound removeCard(card: Card) {
    if (!this.cards.remove(card)) console.error("Failed to remove card:", card);
    else console.info("Removed card:", card);
  }
}

export default Deck;
