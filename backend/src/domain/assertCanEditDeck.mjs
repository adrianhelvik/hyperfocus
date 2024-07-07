// @ts-check

import assertCanEditBoard from "./assertCanEditBoard.mjs";
import knex from "../knex.mjs";
import Boom from "@hapi/boom";

/**
 * @param {any} request
 * @param {string} deckId
 */
export default async function assertCanEditDeck(request, deckId) {
  const deck = await knex("decks").where({ deckId }).first();

  if (!deck) throw Boom.unauthorized("Access denied");

  await assertCanEditBoard(request, deck.boardId);
}
