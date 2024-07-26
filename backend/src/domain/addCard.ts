import { type UUID } from "crypto";
import { knex } from "../knex";
import { Card } from "../types";
import getCard from "./getCard";

export default async function addCard({
  cardId,
  title,
  deckId,
  index,
}: {
  cardId: UUID,
  title: string;
  deckId: UUID;
  index: number;
}): Promise<string> {
  const cards: (Partial<Card> & { insert?: boolean })[] = await knex("cards")
    .where({ deckId })
    .orderBy("index", "asc");

  if (!Number.isInteger(index)) index = cards.length;

  let updates = [];

  cards.splice(index, 0, {
    insert: true,
    cardId,
    title,
    deckId,
    index,
  });

  await knex.transaction(async (knex) => {
    for (let i = 0; i < cards.length; i++) {
      const { insert, ...card } = cards[i];

      if (insert) {
        await knex("cards").insert(card);
      } else if (card.index !== i) {
        updates.push(async () => {
          await knex("cards").where("cardId", card.cardId).update({ index: i });
        });
      }
    }

    await Promise.all(updates.map((fn) => fn()));
  });

  const deck = await knex("decks")
    .where({ deckId })
    .first();

  const createdCard = await getCard(cardId);

  console.log("Created card:", createdCard);

  io
    .to(`board:${deck.boardId}`)
    .emit("addCard", createdCard);

  return cardId;
}
