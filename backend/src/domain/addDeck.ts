import getDenormalizedBoard from "./getDenormalizedBoard";
import { type UUID } from "crypto";
import uuid from "../utils/uuid";
import { knex } from "../knex";

type Options = {
  boardId: UUID;
  index: number;
  title: string;
};

export default async function addDeck({ boardId, index, title }: Options) {
  // TODO: Refactor to be more type safe
  const board = await getDenormalizedBoard(boardId) as any;
  const updates: any[] = [];
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
