import assertCanEditBoard from './assertCanEditBoard.mjs'
import Boom from '@hapi/boom'
import knex from './db.mjs'

export default async function assertCanEditDeck(request, deckId) {
  const deck = await knex('decks').where({ deckId }).first()

  if (!deck) throw Boom.unauthorized('Access denied')

  await assertCanEditBoard(request, deck.boardId)
}
