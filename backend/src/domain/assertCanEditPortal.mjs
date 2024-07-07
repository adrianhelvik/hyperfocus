// @ts-check

import assertCanEditBoard from "./assertCanEditBoard.mjs";
import assertCanEditDeck from "./assertCanEditDeck.mjs";
import knex from "../knex.mjs";
import Boom from "@hapi/boom";

/**
 * @param {any} request
 * @param {string} portalId
 */
export default async function assertCanEditPortal(request, portalId) {
  const portal = await knex("portals").where({ portalId }).first();

  if (!portal) throw Boom.unauthorized("Access denied");

  // The portal must be in a board you can access
  await assertCanEditBoard(request, portal.boardId);

  // The portal must reference a deck in a board you can access
  await assertCanEditDeck(request, portal.deckId);
}
