import authenticate from "./authenticate";
import Boom from "@hapi/boom";
import { knex } from "../knex";
import { ReqWithAuth } from "../types";

export default async function assertIsVerified(request: ReqWithAuth) {
  const session = await authenticate(request);

  const user = await knex("users").where({ userId: session.userId }).first();

  if (!user) throw Boom.unauthorized("The user does not exist");

  // TODO
  // if (!user.verified)
  // throw Boom.unauthorized('Your email has not been verified')
}
