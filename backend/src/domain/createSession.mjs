// @ts-check

import random from "../utils/random.mjs";
import knex from "../knex.mjs";
import sha256 from "../utils/sha256.mjs";

/**
 * @param {string} userId
 * @returns {Promise<string>}
 */
export default async function createSession(userId) {
  const sessionId = await random();

  await knex("sessions").insert({
    sessionId: sha256(sessionId),
    userId,
  });

  return sessionId;
}
