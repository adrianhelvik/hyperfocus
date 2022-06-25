import getDeck from './getDeck.mjs'
import assert from 'assert'
import knex from '../db.mjs'

export default async function getDenormalizedBoard(boardId) {
  assert(typeof boardId === 'string')

  const board = await knex('boards').where('boardId', boardId).first()

  board.children = []

  const decks = await knex('decks')
    .where('decks.boardId', boardId)
    .orderBy('index', 'desc')

  await Promise.all(
    decks.map(async deck => {
      deck.type = 'deck'
      board.children.push(deck)

      deck.cards = await knex('cards')
        .where('deckId', deck.deckId)
        .orderBy('index', 'asc')

      deck.portals = await knex('portals')
        .where('portals.deckId', deck.deckId)
        .leftJoin('boards', 'portals.boardId', 'boards.boardId')
        .leftJoin('decks', 'portals.deckId', 'decks.deckId')
        .select(
          'portals.*',
          'boards.title as boardTitle',
          'decks.title as deckTitle',
        )

      deck.referencedByPortal = deck.portals.length > 0
    }),
  )

  const portals = await knex('portals')
    .where('boardId', boardId)
    .orderBy('index', 'desc')

  await Promise.all(
    portals.map(async portal => {
      portal.type = 'portal'
      portal.target = await getDeck(portal.deckId)
      board.children.push(portal)
    }),
  )

  board.children.sort((a, b) => a.index - b.index)

  return board
}
