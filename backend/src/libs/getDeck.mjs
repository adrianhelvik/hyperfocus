import knex from './db.mjs'

export default async function getDeck(deckId) {
  const deck = await knex('decks')
    .where('deckId', deckId)
    .leftJoin('boards', 'decks.boardId', 'boards.boardId')
    .first()
    .select('decks.*', 'boards.title as boardTitle')

  if (! deck)
    return null

  deck.cards = await knex('cards')
    .where({deckId})
    .orderBy('index', 'asc')

  return deck
}
