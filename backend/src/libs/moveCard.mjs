import knex from './db.mjs'

export default async function moveCard({ cardId, source, target, index }) {
  if (source === target) {
    const cards = await knex('cards')
      .where('deckId', source)
      .andWhere('cardId', '!=', cardId)
      .orderBy('index', 'asc')

    cards.splice(index, 0, {
      cardId,
      index: null,
    })

    await knex.transaction(async knex => {
      const updates = []
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].index !== i) {
          updates.push(async () => {
            await knex('cards')
              .where('cardId', cards[i].cardId)
              .update('index', i)
          })
        }
      }
      await Promise.all(updates.map(fn => fn()))
    })
  } else {
    const sourceCards = await knex('cards')
      .where('deckId', source)
      .andWhere('cardId', '!=', cardId)
      .orderBy('index', 'asc')

    const targetCards = await knex('cards')
      .where('deckId', target)
      .orderBy('index', 'asc')

    targetCards.splice(index, 0, {
      deckId: target,
      index,
    })

    await knex.transaction(async knex => {
      const updates = []

      updates.push(async () => {
        await knex('cards').where({ cardId }).update({
          deckId: target,
          index,
        })
      })

      for (let i = 0; i < sourceCards.length; i++) {
        const card = sourceCards[i]

        if (card.index !== i)
          updates.push(async () => {
            await knex('cards').where('cardId', card.cardId).update('index', i)
          })
      }

      for (let i = 0; i < targetCards.length; i++) {
        const card = targetCards[i]

        if (card.index !== i)
          updates.push(async () => {
            await knex('cards').where('cardId', card.cardId).update('index', i)
          })
      }

      await Promise.all(updates.map(fn => fn()))
    })
  }
}
