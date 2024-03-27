// @ts-check

import authenticate from './authenticate.mjs'
import Boom from '@hapi/boom'
import knex from '../db.mjs'

/**
 * @param {any} request
 */
export default async function assertIsVerified(request) {
  const session = await authenticate(request)

  const user = await knex('users').where({ userId: session.userId }).first()

  if (!user) throw Boom.unauthorized('The user does not exist')

  // TODO
  // if (!user.verified)
  // throw Boom.unauthorized('Your email has not been verified')
}
