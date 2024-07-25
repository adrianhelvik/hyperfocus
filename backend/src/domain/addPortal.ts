import getDenormalizedBoard from "./getDenormalizedBoard";
import { type UUID } from "crypto";
import { knex } from "../knex";

type Options = {
  boardId: UUID,
  deckId: string,
  title: string,
  index: number,
}

export default async function addPortal({ boardId, deckId, title, index }: Options) {
  // TODO: Make this a little more typesafe
  const board = await getDenormalizedBoard(boardId) as any;
  const portalId = crypto.randomUUID();
  const updates: any[] = [];

  board.children.splice(index == null ? board.children.length : index, 0, {
    type: "insert",
    portalId,
    boardId,
    deckId,
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
              await knex("portals")
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

  return portalId;
}
