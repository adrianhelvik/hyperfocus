import { type UUID, randomUUID } from "crypto";
import { knex } from "../knex";

export default async function addCard({
  title,
  deckId,
  index,
}: {
  title: string;
  deckId: UUID;
  index: number;
}): Promise<string> {
  const cards = await knex("cards").where({ deckId }).orderBy("index", "asc");

  if (!Number.isInteger(index)) index = cards.length;

  let updates = [];

  const cardId = randomUUID();

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

  return cardId;
}
