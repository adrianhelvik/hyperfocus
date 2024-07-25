import Boom from "@hapi/boom";
import { knex } from "../knex";
import getDeck from "./getDeck";
import { Portal } from "../types";

export default async function getPortal(portalId: string) {
  const portal: Portal = await knex("portals")
    .where("portals.portalId", portalId)
    .first();

  const deck = await getDeck(portal.deckId);

  if (!deck) return Boom.failedDependency("Portal referenced by deck not found");

  portal.target = deck;
  portal.deckTitle = deck.title;
  portal.type = "portal";

  return portal;
}
