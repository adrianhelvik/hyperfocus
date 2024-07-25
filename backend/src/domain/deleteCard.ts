import deleteCardImages from "./deleteCardImages";
import getCard from "./getCard";
import { knex } from "../knex";

export default async function deleteCard(cardId: string) {
  const card = await getCard(cardId);

  await deleteCardImages(cardId);

  await knex.transaction(async (knex) => {
    await knex("cards")
      .where("deckId", card.deckId)
      .andWhere(
        "index",
        ">",
        knex("cards").where("cardId", cardId).select("index")
      )
      .andWhere("cardId", "!=", cardId)
      .decrement("index")
      .catch((e) => {
        throw Error(e.message);
      });

    await knex("cards").where({ cardId }).del();
  });
}
