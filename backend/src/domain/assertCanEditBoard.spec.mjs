import assertCanEditBoard from './assertCanEditBoard.mjs'
import createSession from './createSession.mjs'
import createBoard from './createBoard.mjs'
import createUser from './createUser.mjs'
import { v4 as uuid } from 'uuid'
import knex from '../db.mjs'

it('does not throw for an owner', async () => {
  const boardId = uuid()
  const userId = uuid()

  await createUser({
    email: 'test@test.com',
    username: 'test',
    password: 'test',
    userId,
  })

  const sessionId = await createSession(userId)

  await createBoard({
    createdBy: userId,
    boardId,
  })

  const request = {
    headers: {
      authorization: `Bearer ${sessionId}`,
    },
  }

  await assertCanEditBoard(request, boardId)
})
