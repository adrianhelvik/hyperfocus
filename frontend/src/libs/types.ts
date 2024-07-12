export type Coord = { x: number; y: number };

export type Confirmable = React.ComponentType<{
  confirm: (Template: React.FC) => Promise<boolean>;
  confirmInPlace: (event: MouseEvent, Template: React.FC) => Promise<boolean>;
}>;

export type Project = {
  color?: string;
  title: string;
};

export type Card = {
  title: string,
  cardId: string,
  images: Array<string>;
};

export type Deck = {
  type: "deck";
  title: string;
  color: string;
  cards: Card[];
  deckId: string;
};

export type Portal = {
  type: "portal";
  portalId: string;
  title: string;
  target: Deck;
};

export type BoardParam = {
  title: string;
};

export type Board = {
    children: (Deck | Portal)[];
    color: string;
    title: string;
    boardId: string;
    decks: Deck[];
};
