import assertCanEditBoard from 'assertCanEditBoard'
import createSession from 'createSession'
import createBoard from 'createBoard'
import createUser from 'createUser'
import uuid from 'uuid/v4'
import knex from 'db'

it('does not throw for an owner', async () => {
  const sessionId = uuid()
  const boardId = uuid()
  const userId = uuid()

  await createUser({
    email: 'test@test.com',
    username: 'test',
    password: 'test',
    userId,
  })

  await createSession({
    sessionId,
    userId,
  })

  await createBoard({
    createdBy: userId,
    boardId,
  })

  const request = {
    headers: {
      authorization: `Bearer ${sessionId}`,
    }
  }

  await assertCanEditBoard(request, boardId)
})
