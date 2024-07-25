export type DbBoard = {
  boardId: string
  title: string
  createdBy: string
  createdAt: Date
}

export type Deck = {
  title: string;
  cards: Card[]
  deckId: string
  index: number;
  type: "deck";
}

export type Board = {
  title: string;
  boardId: string;
  children: (Deck | Portal)[]
}

export type Card = {
  cardId: string
  deckId: string
  boardId: string
  images: string[]
}

export type Portal = {
  deckTitle: string
  target: Deck
  portalId: string
  deckId: string
  boardId: string
  index: number;
  type: "portal";
}

export type BoardChild = (Deck | Portal) & {
  portalId?: string
}

export type Route<Payload, Response> = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  handler: (options: { payload: Payload }) => Promise<Response>
}

export type ReqWithAuth = {
  headers: {
    authorization: string
  }
}
