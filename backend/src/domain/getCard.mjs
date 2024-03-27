// @ts-check

import knex from '../db.mjs'

/**
 * @param {string} cardId
 * @returns {Promise<import("../types").Card>}
 */
export default async function getCard(cardId) {
  const card = await knex('cards')
    .where({ cardId })
    .leftJoin('decks', 'cards.deckId', 'decks.deckId')
    .first()

  card.images = await knex("cardImages")
    .where({ cardId: card.cardId })
    .orderBy("index", "asc")
    .select("url")
    .then(it => it.map(item => item.url))

  return card
}
