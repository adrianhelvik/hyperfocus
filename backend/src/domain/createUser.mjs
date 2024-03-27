// @ts-check

import requireString from '../utils/requireString.mjs'
import createHash from '../utils/createHash.mjs'
import uuid from '../utils/uuid.mjs'
import Boom from '@hapi/boom'
import knex from '../db.mjs'

/**
 * @param {object} options
 * @param {string} [options.username]
 * @param {string} options.password
 * @param {string} [options.userId]
 * @param {string} options.email
 * @returns {Promise<string>}
 */
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
