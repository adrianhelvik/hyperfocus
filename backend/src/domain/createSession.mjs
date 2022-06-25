import random from '../utils/random.mjs'
import knex from '../db.mjs'

export default async function createSession(userId) {
  const sessionId = await random()

  await knex('sessions').insert({
    sessionId,
    userId,
  })

  return sessionId
}
