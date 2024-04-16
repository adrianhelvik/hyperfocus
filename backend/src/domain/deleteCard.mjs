// @ts-check

import deleteCardImages from "./deleteCardImages.mjs";
import getCard from "./getCard.mjs";
import knex from "../knex.mjs";

/**
 * @param {string} cardId
 * @returns {Promise<void>}
 */
export default async function deleteCard(cardId) {
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
