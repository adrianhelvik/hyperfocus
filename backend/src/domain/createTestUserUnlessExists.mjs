import createUser from "./createUser.mjs";
import knex from "../knex.mjs";

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
    console.log("test user existed. username: test, password: secret");
  }
}
