import knex from "../knex.mjs";

export default async function getDeck(deckId) {
  const deck = await knex("decks")
    .where("deckId", deckId)
    .leftJoin("boards", "decks.boardId", "boards.boardId")
    .first()
    .select("decks.*", "boards.title as boardTitle");

  if (!deck) return null;

  deck.cards = await knex("cards").where({ deckId }).orderBy("index", "asc");

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
