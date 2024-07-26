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
  boardId: string;
  deckId: string;
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

export type PortalTarget = Deck & {
  boardTitle: string;
};

export type Portal = {
  type: "portal";
  boardId: string;
  portalId: string;
  title: string;
  target: PortalTarget;
};

export type BoardParam = {
  title: string;
};

export type BoardChild = Deck | Portal;

export type Board = {
  children: BoardChild[];
  color: string | null;
  title: string;
  boardId: string;
};

export type UserStat = {
  userId: string;
  email: string;
  boardCount: number;
  cardCount: number;
};
