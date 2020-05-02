import uuid from '../uuid.mjs'
import knex from './db.mjs'

export default async function createSession(userId) {
  const sessionId = uuid()

  await knex('sessions')
    .insert({
      sessionId,
      userId,
    })

  return sessionId
}
