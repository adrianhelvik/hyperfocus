import { knex } from "../knex";
import { Board } from "../types";

export default async function getBoardsForUser(userId: string) {
  const boards = await knex("boards")
    .leftJoin("teamBoards", "boards.boardId", "teamBoards.boardId")
    .leftJoin("userTeams", "teamBoards.teamId", "userTeams.teamId")
    .leftJoin("teams", "teams.teamId", "userTeams.userId")
    .where("boards.createdBy", userId)
    .orWhere("userTeams.userId", userId)
    .select("boards.*")
    .orderBy("createdAt", "desc");

  await Promise.all(
    boards.map(async (board: Board) => {
      board.children = [];

      const decks = await knex("decks")
        .where("boardId", board.boardId)
        .orderBy("index", "asc");

      const portals = await knex("portals")
        .where("boardId", board.boardId)
        .orderBy("index", "asc");

      for (const deck of decks) {
        deck.boardTitle = board.title;
        board.children.push({
          type: "deck",
          ...deck,
        });
      }

      for (const portal of portals)
        board.children.push({
          type: "portal",
          ...portal,
        });

      board.children.sort((a, b) => a.index - b.index);
    })
  );

  return boards;
}
