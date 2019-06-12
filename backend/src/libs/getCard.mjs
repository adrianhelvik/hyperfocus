import knex from 'db'

export default async function getCard(cardId) {
  const card = await knex('cards')
    .where({cardId})
    .leftJoin('decks', 'cards.deckId', 'decks.deckId')
    .first()

  return card
}
