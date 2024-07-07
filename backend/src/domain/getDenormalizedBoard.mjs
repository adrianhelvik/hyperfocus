import getDeck from "./getDeck.mjs";
import knex from "../knex.mjs";
import assert from "assert";

/**
 * @typedef {import("../types").Board} Board
 * @typedef {import("../types").DbBoard} DbBoard
 *
 * @param {string} boardId
 * @returns {Board>}
 */
export default async function getDenormalizedBoard(boardId) {
  assert(typeof boardId === "string");

  const board = await knex("boards").where("boardId", boardId).first();

  board.children = [];

  const decks = await knex("decks")
    .where("decks.boardId", boardId)
    .orderBy("index", "desc");

  await Promise.all(
    decks.map(async (deck) => {
      deck.type = "deck";
      board.children.push(deck);

      deck.cards = await knex("cards")
        .where("deckId", deck.deckId)
        .orderBy("index", "asc");

      await Promise.all(
        deck.cards.map(async (card) => {
          card.images = await knex("cardImages")
            .where({ cardId: card.cardId })
            .orderBy("index", "asc")
            .select("url")
            .then((it) => it.map((item) => item.url));
        })
      );

      deck.portals = await knex("portals")
        .where("portals.deckId", deck.deckId)
        .leftJoin("boards", "portals.boardId", "boards.boardId")
        .leftJoin("decks", "portals.deckId", "decks.deckId")
        .select(
          "portals.*",
          "boards.title as boardTitle",
          "decks.title as deckTitle"
        );

      deck.referencedByPortal = deck.portals.length > 0;
    })
  );

  const portals = await knex("portals")
    .where("boardId", boardId)
    .orderBy("index", "desc");

  await Promise.all(
    portals.map(async (portal) => {
      portal.type = "portal";
      portal.target = await getDeck(portal.deckId);
      board.children.push(portal);
    })
  );

  board.children.sort((a, b) => a.index - b.index);

  return board;
}
