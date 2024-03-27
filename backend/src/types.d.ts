export type DbBoard = {
  boardId: string
  title: string
  createdBy: string
  createdAt: Date
}

enum BoardChildType {
  Deck = 'deck',
  Portal = 'portal',
}

export type Deck = {
  deckId: string
  type: BoardChildType.Deck
}

export type Board = Board & {
  children: Deck[]
}

export type Card = {
  deckId: string
  boardId: string
}

export type Portal = {
  portalId: string
  deckId: string
  boardId: string
  type: BoardChildType.Portal
}

export type BoardChild = (Deck | Portal) & {
    portalId?: string
}

export type Route<Payload, Response> = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  handler: (options: { payload: Payload }) => Promise<Response>
}
