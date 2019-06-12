import isPasswordCorrect from 'isPasswordCorrect'
import createSession from 'createSession'
import Boom from '@hapi/boom'
import getUser from 'getUser'

export default async function login(username, password) {
  if (typeof username !== 'string')
    throw Boom.badRequest('Please provide a username')
  if (typeof password !== 'string')
    throw Boom.badRequest('Please provide a password')

  const user = await getUser(username)

  if (! user)
    throw Boom.unauthorized('Invalid credentials')

  if (! await isPasswordCorrect(password, user.hash)) {
    throw Boom.unauthorized('Invalid credentials')
  }

  if (! user)
    throw Boom.unauthorized('The username/email did not exist')

  const sessionId = await createSession(user.userId)

  return sessionId
}
