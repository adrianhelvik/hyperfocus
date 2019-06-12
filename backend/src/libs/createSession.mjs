import uuid from 'uuid/v4'
import knex from 'db'

export default async function createSession(userId) {
  const sessionId = uuid()

  await knex('sessions')
    .insert({
      sessionId,
      userId,
    })

  return sessionId
}
