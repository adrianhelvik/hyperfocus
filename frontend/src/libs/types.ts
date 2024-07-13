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
  title: string;
  cardId: string;
  images: Array<string>;
};

export type Deck = {
  type: "deck";
  boardId: string;
  title: string;
  color: string;
  cards: Card[];
  deckId: string;
};

export type Portal = {
  type: "portal";
  boardId: string;
  portalId: string;
  title: string;
  target: Deck;
};

export type BoardParam = {
  title: string;
};

export type BoardChild = Deck | Portal;

export type Board = {
  children: BoardChild[];
  color: string;
  title: string;
  boardId: string;
};
