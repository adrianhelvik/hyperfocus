import assertCanEditBoard from "./assertCanEditBoard";
import assertCanEditDeck from "./assertCanEditDeck";
import { knex } from "../knex";
import Boom from "@hapi/boom";
import { ReqWithAuth } from "../types";

export default async function assertCanEditPortal(request: ReqWithAuth, portalId: string) {
  const portal = await knex("portals").where({ portalId }).first();

  if (!portal) throw Boom.unauthorized("Access denied");

  // The portal must be in a board you can access
  await assertCanEditBoard(request, portal.boardId);

  // The portal must reference a deck in a board you can access
  await assertCanEditDeck(request, portal.deckId);
}
