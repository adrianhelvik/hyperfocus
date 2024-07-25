import createUser from "./createUser";
import { knex } from "../knex";

export default async function createTestUserUnlessExists() {
  const testUser = await knex("users").where("username", "test").first();

  if (!testUser) {
    const userId = await createUser({
      username: "test",
      email: "test@test.com",
      password: "secret",
    });

    const teamId = "test";

    await knex("teams").insert({
      teamId,
    });

    await knex("userTeams").insert({
      userId,
      teamId,
    });

    console.log("test user created. username: test, password: secret");
  } else {
    await knex("users")
      .where({ email: "test@test.com" })
      .update({ role: "admin" });

    console.log("test user existed. username: test, password: secret");
  }
}
