import assertIsVerified from './assertIsVerified.mjs'
import requireString from './requireString.mjs'
import authenticate from './authenticate.mjs'
import getUser from './getUser.mjs'
import Boom from '@hapi/boom'
import assert from 'assert'
import knex from './db.mjs'

export default async function assertCanEditBoard(request, boardId) {
  requireString({ boardId })

  const session = await authenticate(request)
  await assertIsVerified(request)

  const board = await knex('boards').where('boardId', boardId).first()

  if (!board) throw Boom.notFound('No board with the given id exists')

  if (board.createdBy !== session.userId) {
    const teamBoard = await knex('teamBoards').where('boardId', boardId).first()
    const userTeams = await knex('userTeams').where('userId', session.userId)

    if (
      !teamBoard ||
      !userTeams.length ||
      !userTeams.some(t => t.teamId === teamBoard.teamId)
    )
      throw Boom.unauthorized('You are not authorized to view this board')
  }
}
