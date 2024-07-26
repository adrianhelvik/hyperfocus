import { Card } from "../types";
import { knex } from "../knex";

export default async function getCard(cardId: string): Promise<Card> {
  const card = await knex("cards")
    .where({ cardId })
    .leftJoin("decks", "cards.deckId", "decks.deckId")
    .select("decks.*", "cards.*")
    .first();

  card.images = await knex("cardImages")
    .where({ cardId: card.cardId })
    .orderBy("index", "asc")
    .select("url")
    .then((it) => it.map((item) => item.url));

  return card;
}
