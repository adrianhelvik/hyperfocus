// @ts-check

import Boom from '@hapi/boom'
import knex from '../knex.mjs'

/**
 * Cache requests, so we never authenticate
 * twice with the same payload.
 */
export const cache = new WeakMap()

/**
 * Authenticates a request and returns the session.
 *
 * @param {{ headers: { authorization: string } }} request
 */
export default async function authenticate(request) {
  if (cache.has(request)) return cache.get(request)

  const { authorization } = request.headers

  if (!authorization)
    throw Boom.unauthorized('No authorization header provided')

  const sessionId = authorization.replace(/^Bearer /, '')

  const session = await knex('sessions').where({ sessionId }).first()

  if (!session) throw Boom.unauthorized('Invalid session id provided')

  cache.set(request, session)

  return session
}
