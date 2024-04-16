import Boom from "@hapi/boom";
import knex from "../knex.mjs";

export default async function getUser(arg) {
  if (typeof arg !== "string")
    throw Boom.badRequest("Expected a the username/email to be a string");

  arg = arg.toLowerCase();

  if (arg.includes("@"))
    return await knex("users").where({ email: arg }).first();
  else return await knex("users").where({ username: arg }).first();
}
