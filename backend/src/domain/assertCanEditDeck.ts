import assertCanEditBoard from "./assertCanEditBoard";
import { ReqWithAuth } from "../types";
import Boom from "@hapi/boom";
import { knex } from "../knex";

export default async function assertCanEditDeck(request: ReqWithAuth, deckId: string) {
  const deck = await knex("decks").where({ deckId }).first();

  if (!deck) throw Boom.unauthorized("Access denied");

  await assertCanEditBoard(request, deck.boardId);
}
