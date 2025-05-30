import { knex } from "../knex";
import { Deck } from "../types";

export default async function getDeck(deckId: string) {
  const deck: Deck = await knex("decks")
    .where("deckId", deckId)
    .leftJoin("boards", "decks.boardId", "boards.boardId")
    .first()
    .select("decks.*", "boards.title as boardTitle");

  if (!deck) return null;

  deck.cards = await knex("cards").where({ deckId }).orderBy("index", "asc");
  deck.type = "deck";

  await Promise.all(
    deck.cards.map(async (card) => {
      card.images = await knex("cardImages")
        .where({ cardId: card.cardId })
        .orderBy("index", "asc")
        .select("url")
        .then((it) => it.map((item) => item.url));
    })
  );

  return deck;
}
