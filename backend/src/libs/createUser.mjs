import requireString from './requireString.mjs'
import createHash from './createHash.mjs'
import Boom from '@hapi/boom'
import uuid from '../uuid.mjs'
import knex from './db.mjs'

export default async function createUser({
  username,
  password,
  userId,
  email,
}) {
  const hash = await createHash(password)

  requireString({ email, password })

  if (!username) username = null
  else username = username.toLowerCase()

  if (!email.includes('@')) throw Boom.badRequest('Invalid email')

  if (username && username.includes('@'))
    throw Boom.badRequest('Invalid username')

  if (!userId) userId = uuid()

  email = email.toLowerCase()

  await knex('users')
    .insert({
      userId,
      username,
      email,
      hash,
    })
    .catch(error => {
      console.log(JSON.stringify(error, null, 2))
      if (error.constraint === 'users_email_unique')
        throw Boom.badRequest('The email is already in use')
      throw error
    })

  return userId
}
