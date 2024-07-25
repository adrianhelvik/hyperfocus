import { type UUID } from "crypto";
import { knex } from "../knex";

export default async function createBoard({
  createdBy,
  boardId,
  title = "",
}: {
  createdBy: UUID;
  boardId: UUID;
  title: string;
}) {
  await knex("boards").insert({
    createdBy,
    boardId,
    title,
  });
}
