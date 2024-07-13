import knex from "../knex.mjs";
import getDeck from "./getDeck.mjs";

export default async function getPortal(portalId) {
  const portal = await knex("portals")
    .where("portals.portalId", portalId)
    .first();

  const deck = await getDeck(portal.deckId);

  portal.target = deck;
  portal.deckTitle = deck.title;
  portal.type = "portal";

  return portal;
}
