import random from "../utils/random";
import sha256 from "../utils/sha256";
import { knex } from "../knex";

export default async function createSession(userId: string) {
  const sessionId = await random();

  await knex("sessions").insert({
    sessionId: sha256(sessionId),
    userId,
  });

  return sessionId;
}
