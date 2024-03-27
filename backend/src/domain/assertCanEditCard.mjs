// @ts-check

import assertCanEditDeck from './assertCanEditDeck.mjs'
import getCard from './getCard.mjs'
import Boom from '@hapi/boom'

export default async function assertCanEditcard(request, cardId) {
  const card = await getCard(cardId)

  if (!card) throw Boom.notFound('The card does not exist')

  await assertCanEditDeck(request, card.deckId)
}
