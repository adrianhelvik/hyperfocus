import authenticate from "./authenticate";
import { ReqWithAuth } from "../types";
import { knex } from "../knex";
import Boom from "@hapi/boom";

export default async function assertIsAdmin(request: ReqWithAuth) {
  const { userId } = await authenticate(request);

  const user = await knex("users")
    .where({ userId })
    .first();

  if (!user) throw Boom.forbidden("Your user was not found");

  console.log("User:", user);
  if (user.role !== "admin") throw Boom.forbidden("You are not admin. Shoooo");
}
