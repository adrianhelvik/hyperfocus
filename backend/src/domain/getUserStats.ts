import { knex } from "../knex";

type UserStat = {
  userId: string;
  email: string;
  role: "user" | "admin";
  verifiedEmail: boolean;
  boardCount: number;
  cardCount: number;
}

export default async function getUserStats() {
  const usersQuery = knex("users")
    .select("userId", "email", "role", "verifiedEmail");

  const result: UserStat[] = [];

  for await (const user of usersQuery.stream()) {
    result.push(user);
    user.boardCount = await knex("boards")
      .where({ createdBy: user.userId })
      .count("*")
      .then(res => Number(res[0].count));
    user.cardCount = await knex("cards")
      .leftJoin("decks", "decks.deckId", "cards.deckId")
      .leftJoin("boards", "boards.boardId", "decks.boardId")
      .where("boards.createdBy", user.userId)
      .count("*")
      .then(res => Number(res[0].count));
  }

  return result;
}
