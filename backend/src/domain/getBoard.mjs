import knex from '../db.mjs'

export default async function getBoard(boardId) {
  const board = await knex('boards')
    .select('boards.*')
    .where('boardId', boardId)
    .first()

  board.children = []

  const decks = await knex('decks')
    .where('boardId', board.boardId)
    .orderBy('index', 'asc')

  const portals = await knex('portals')
    .where('boardId', board.boardId)
    .orderBy('index', 'asc')

  for (const deck of decks) {
    deck.boardTitle = board.title
    board.children.push({
      type: 'deck',
      ...deck,
    })
  }

  for (const portal of portals)
    board.children.push({
      type: 'portal',
      ...portal,
    })

  board.children.sort((a, b) => a.index - b.index)
}
