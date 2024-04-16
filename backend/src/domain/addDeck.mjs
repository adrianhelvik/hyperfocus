// @ts-check

import getDenormalizedBoard from "./getDenormalizedBoard.mjs";
import uuid from "../utils/uuid.mjs";
import knex from "../knex.mjs";

/**
 * @param {object} options
 * @param {string} options.boardId
 * @param {number} options.index
 * @param {string} options.title
 * @returns {Promise<string>}
 */
export default async function addDeck({ boardId, index, title }) {
  const board = await getDenormalizedBoard(boardId);
  const updates = [];
  const deckId = uuid();

  board.children.splice(index == null ? board.children.length : index, 0, {
    deckId,
    type: "insert",
    boardId,
    title,
  });

  await knex.transaction(async (knex) => {
    for (let i = 0; i < board.children.length; i++) {
      if (board.children[i].index !== i) {
        updates.push([board.children[i], i]);
      }
    }

    await Promise.all(
      updates.map(async ([{ type, ...child }, i]) => {
        switch (type) {
          case "insert":
            {
              await knex("decks")
                .insert({
                  index: i,
                  ...child,
                })
                .catch((e) => {
                  throw Error(e.message);
                });
            }
            break;
          case "deck":
            {
              await knex("decks")
                .where("deckId", child.deckId)
                .update("index", i);
            }
            break;
          case "portal":
            {
              await knex("portals")
                .where("portalId", child.portalId)
                .update("index", i);
            }
            break;
          default: {
            throw Error(
              `Could not update index for child of type: ${child.type}`
            );
          }
        }
      })
    );
  });

  return deckId;
}
