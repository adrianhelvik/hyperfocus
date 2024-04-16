// @ts-check

import uuid from '../utils/uuid.mjs'
import isInteger from 'is-integer'
import knex from '../knex.mjs'

/**
 * @param {object} args
 * @param {string} args.title
 * @param {string} args.deckId
 * @param {number} args.index
 * @returns {Promise<string>}
 */
export default async function addCard({ title, deckId, index }) {
  const cards = await knex('cards').where({ deckId }).orderBy('index', 'asc')

  if (!isInteger(index)) index = cards.length

  let updates = []

  const cardId = uuid()

  cards.splice(index, 0, {
    insert: true,
    cardId,
    title,
    deckId,
    index,
  })

  await knex.transaction(async knex => {
    for (let i = 0; i < cards.length; i++) {
      const { insert, ...card } = cards[i]

      if (insert) {
        await knex('cards').insert(card)
      } else if (card.index !== i) {
        updates.push(async () => {
          await knex('cards').where('cardId', card.cardId).update({ index: i })
        })
      }
    }

    await Promise.all(updates.map(fn => fn()))
  })

  return cardId
}
