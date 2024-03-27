// @ts-check

import isPasswordCorrect from '../utils/isPasswordCorrect.mjs'
import createSession from './createSession.mjs'
import getUser from './getUser.mjs'
import Boom from '@hapi/boom'

/**
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>}
 */
export default async function login(username, password) {
  if (typeof username !== 'string')
    throw Boom.badRequest('Please provide a username')
  if (typeof password !== 'string')
    throw Boom.badRequest('Please provide a password')

  const user = await getUser(username)

  if (!user) throw Boom.unauthorized('Invalid credentials')

  if (!(await isPasswordCorrect(password, user.hash))) {
    throw Boom.unauthorized('Invalid credentials')
  }

  if (!user) throw Boom.unauthorized('The username/email did not exist')

  const sessionId = await createSession(user.userId)

  return sessionId
}
