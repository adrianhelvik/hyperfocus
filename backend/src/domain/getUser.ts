import Boom from "@hapi/boom";
import { knex } from "../knex";

export default async function getUser(arg: string) {
  if (typeof arg !== "string")
    throw Boom.badRequest("Expected a the username/email to be a string");

  arg = arg.toLowerCase();

  if (arg.includes("@"))
    return await knex("users").where({ email: arg }).first();
  else return await knex("users").where({ username: arg }).first();
}
