import moveBoardChildToIndex from './domain/moveBoardChildToIndex.mjs'
import getDenormalizedBoard from './domain/getDenormalizedBoard.mjs'
import assertCanEditPortal from './domain/assertCanEditPortal.mjs'
import assertCanEditBoard from './domain/assertCanEditBoard.mjs'
import assertCanEditDeck from './domain/assertCanEditDeck.mjs'
import assertIsVerified from './domain/assertIsVerified.mjs'
import getBoardsForUser from './domain/getBoardsForUser.mjs'
import requireInteger from './utils/requireInteger.mjs'
import createSession from './domain/createSession.mjs'
import requireString from './utils/requireString.mjs'
import authenticate from './domain/authenticate.mjs'
import createBoard from './domain/createBoard.mjs'
import createUser from './domain/createUser.mjs'
import createHash from './utils/createHash.mjs'
import moveCard from './domain/moveCard.mjs'
import getCard from './domain/getCard.mjs'
import getUser from './domain/getUser.mjs'
import login from './domain/login.mjs'
import uuid from './utils/uuid.mjs'
import isInteger from 'is-integer'
import Boom from '@hapi/boom'
import assert from 'assert'
import knex from './db.mjs'

export const loginRoute = {
  method: 'POST',
  path: '/login',
  async handler(request, reply) {
    const { username, password } = request.payload
    const sessionId = await login(username, password)

    return {
      sessionId,
    }
  },
}

export const authenticateRoute = {
  method: 'POST',
  path: '/authenticate',
  handler: authenticate,
}

export const createBoardRoute = {
  method: 'POST',
  path: '/createBoard',
  async handler(request, reply) {
    const { boardId, title } = request.payload
    const { userId } = await authenticate(request)

    await assertIsVerified(request)

    await createBoard({
      createdBy: userId,
      boardId,
      title,
    })

    return { success: true }
  },
}

export const ownBoardsRoute = {
  method: 'POST',
  path: '/ownBoards',
  async handler(request, reply) {
    const session = await authenticate(request)
    const boards = await getBoardsForUser(session.userId)

    return { boards }
  },
}

export const getBoardRoute = {
  method: 'POST',
  path: '/getBoard',
  async handler(request, reply) {
    const session = await authenticate(request)
    const { boardId } = request.payload

    if (typeof boardId !== 'string')
      throw Boom.badRequest('boardId must be a string')

    await assertCanEditBoard(request, boardId)

    return await getDenormalizedBoard(boardId)
  },
}

export const logoutRoute = {
  method: 'POST',
  path: '/logout',
  async handler(request, reply) {
    const session = await authenticate(request)

    await knex('sessions').where('sessionId', session.sessionId).del()

    return { success: true }
  },
}

export const addDeckRoute = {
  method: 'POST',
  path: '/addDeck',
  async handler(request, reply) {
    const session = await authenticate(request)
    const { boardId, title, index } = request.payload

    if (typeof boardId !== 'string')
      throw Boom.badRequest('boardId must be a string')

    await assertCanEditBoard(request, boardId)

    const board = await getDenormalizedBoard(boardId)
    const updates = []
    const deckId = uuid()

    board.children.splice(index == null ? board.children.length : index, 0, {
      deckId,
      type: 'insert',
      boardId,
      title,
    })

    await knex.transaction(async knex => {
      for (let i = 0; i < board.children.length; i++) {
        if (board.children[i].index !== i) {
          updates.push([board.children[i], i])
        }
      }

      await Promise.all(
        updates.map(async ([{ type, ...child }, i]) => {
          switch (type) {
            case 'insert':
              {
                const { type, ...deck } = child
                await knex('decks')
                  .insert({
                    index: i,
                    ...child,
                  })
                  .catch(e => {
                    throw Error(e.message)
                  })
              }
              break
            case 'deck':
              {
                await knex('decks')
                  .where('deckId', child.deckId)
                  .update('index', i)
              }
              break
            case 'portal':
              {
                await knex('portals')
                  .where('portalId', child.portalId)
                  .update('index', i)
              }
              break
            default: {
              throw Error(
                `Could not update index for child of type: ${child.type}`,
              )
            }
          }
        }),
      )
    })

    return { deckId }
  },
}

export const addPortalRoute = {
  method: 'POST',
  path: '/addPortal',
  async handler(request, reply) {
    const session = await authenticate(request)
    const { boardId, title, index, deckId } = request.payload

    if (typeof boardId !== 'string')
      throw Boom.badRequest('boardId must be a string')

    await assertCanEditBoard(request, boardId)

    const board = await getDenormalizedBoard(boardId)
    const updates = []
    const portalId = uuid()

    board.children.splice(index == null ? board.children.length : index, 0, {
      type: 'insert',
      portalId,
      boardId,
      deckId,
      title,
    })

    await knex.transaction(async knex => {
      for (let i = 0; i < board.children.length; i++) {
        if (board.children[i].index !== i) {
          updates.push([board.children[i], i])
        }
      }

      await Promise.all(
        updates.map(async ([{ type, ...child }, i]) => {
          switch (type) {
            case 'insert':
              {
                const { type, ...deck } = child
                await knex('portals')
                  .insert({
                    index: i,
                    ...child,
                  })
                  .catch(e => {
                    throw Error(e.message)
                  })
              }
              break
            case 'deck':
              {
                await knex('decks')
                  .where('deckId', child.deckId)
                  .update('index', i)
              }
              break
            case 'portal':
              {
                await knex('portals')
                  .where('portalId', child.portalId)
                  .update('index', i)
              }
              break
            default: {
              throw Error(
                `Could not update index for child of type: ${child.type}`,
              )
            }
          }
        }),
      )
    })

    return { portalId }
  },
}

export const addCardRoute = {
  method: 'POST',
  path: '/addCard',
  async handler(request, reply) {
    const session = await authenticate(request)
    const { title, deckId } = request.payload

    if (typeof deckId !== 'string')
      throw Boom.badRequest('deckId must be a string')

    if (typeof title !== 'string')
      throw Boom.badRequest('title must be a string')

    const { boardId } = await knex('decks').where({ deckId }).first()

    await assertCanEditBoard(request, boardId)

    const cards = await knex('cards').where({ deckId }).orderBy('index', 'asc')

    const index = !isInteger(request.payload.index)
      ? cards.length
      : request.payload.index

    let updates = []

    const cardId = uuid()

    cards.splice(index, 0, {
      insert: true,
      cardId,
      title,
      deckId,
      index,
    })

    await knex.transaction(async knex => {
      for (let i = 0; i < cards.length; i++) {
        const { insert, ...card } = cards[i]

        if (insert) {
          await knex('cards').insert(card)
        } else if (card.index !== i) {
          updates.push(async () => {
            await knex('cards')
              .where('cardId', card.cardId)
              .update({ index: i })
          })
        }
      }

      await Promise.all(updates.map(fn => fn()))
    })

    return { cardId }
  },
}

export const deleteCardRoute = {
  method: 'POST',
  path: '/deleteCard',
  async handler(request, reply) {
    const { cardId } = request.payload

    if (!cardId) throw Boom.badRequest('cardId is required')

    const card = await knex('cards')
      .where({ cardId })
      .leftJoin('decks', 'cards.deckId', 'decks.deckId')
      .first()

    if (!card) throw Boom.notFound('The card does not exist')

    await assertCanEditBoard(request, card.boardId)

    console.log(card.index)

    await knex.transaction(async knex => {
      await knex('cards')
        .where('deckId', card.deckId)
        .andWhere(
          'index',
          '>',
          knex('cards').where('cardId', cardId).select('index'),
        )
        .andWhere('cardId', '!=', cardId)
        .decrement('index')
        .catch(e => {
          throw Error(e.message)
        })

      await knex('cards').where({ cardId }).del()
    })

    return { success: true }
  },
}

export const moveCardRoute = {
  method: 'POST',
  path: '/moveCard',
  async handler(request) {
    const { cardId, source, target, index } = request.payload

    requireString({ cardId, source, target })
    requireInteger({ index })

    const card = await getCard(cardId)

    if (!card) throw Boom.notFound('The card does not exist')

    if (card.deckId !== source)
      throw Boom.badRequest('Card did not belong to the source deck')

    await assertCanEditBoard(request, card.boardId)

    await moveCard({ cardId, source, target, index })

    return { success: true }
  },
}

export const moveBoardChildToIndexRoute = {
  method: 'POST',
  path: '/moveBoardChildToIndex',
  async handler(request) {
    const { item, index, boardId } = request.payload

    if (typeof boardId !== 'string')
      throw Boom.badRequest('boardId must be a string')

    await assertCanEditBoard(request, boardId)

    await moveBoardChildToIndex({ item, index, boardId })

    return { success: true }
  },
}

export const deleteDeckRoute = {
  method: 'POST',
  path: '/deleteDeck',
  async handler(request) {
    const { deckId } = request.payload
    const deck = await knex('decks').where({ deckId }).first()

    await assertCanEditBoard(request, deck.boardId)

    await knex('decks').where({ deckId }).del()

    return { success: true }
  },
}

export const deletePortalRoute = {
  method: 'POST',
  path: '/deletePortal',
  async handler(request) {
    const { portalId } = request.payload

    if (typeof portalId !== 'string')
      throw Boom.badRequest('Please provide a portalId')

    const portal = await knex('portals').where({ portalId }).first()

    if (!portal)
      throw Boom.badRequest('No portal with the given portalId exists')

    await assertCanEditBoard(request, portal.boardId)

    await knex('portals').where({ portalId }).del()

    return { success: true }
  },
}

export const deleteBoardRoute = {
  method: 'POST',
  path: '/deleteBoard',
  async handler(request) {
    const { boardId } = request.payload
    await assertCanEditBoard(request, boardId)

    const decks = await knex('decks').where({ boardId })

    await knex.transaction(async trx => {
      for (const { deckId } of decks) {
        await knex('portals').where({ deckId }).del()
        await knex('cards').where({ deckId }).del()
      }
      await knex('decks').where({ boardId }).del()
      await knex('portals').where({ boardId }).del()
      await knex('boards').where({ boardId }).del()
    })

    return { success: true }
  },
}

export const setDeckColorRoute = {
  method: 'POST',
  path: '/setDeckColor',
  async handler(request) {
    const { deckId, color } = request.payload
    await assertCanEditDeck(request, deckId)

    await knex('decks').where({ deckId }).update({ color })

    return { success: true }
  },
}

export const setBoardColorRoute = {
  method: 'POST',
  path: '/setBoardColor',
  async handler(request) {
    const { boardId, color } = request.payload
    await assertCanEditBoard(request, boardId)

    await knex('boards').where({ boardId }).update({ color })

    return { success: true }
  },
}

export const setDeckTitleRoute = {
  method: 'POST',
  path: '/setDeckTitle',
  async handler(request) {
    const { deckId, title } = request.payload
    await assertCanEditDeck(request, deckId)

    await knex('decks').where({ deckId }).update({ title })

    return { success: true }
  },
}

export const setPortalTitleRoute = {
  method: 'POST',
  path: '/setPortalTitle',
  async handler(request) {
    const { portalId, title } = request.payload
    await assertCanEditPortal(request, portalId)

    await knex('portals').where({ portalId }).update({ title })

    return { success: true }
  },
}

export const registerUserRoute = {
  method: 'POST',
  path: '/registerUser',
  async handler(request) {
    const { email, password } = request.payload

    requireString({ email, password })

    await createUser({
      password,
      email,
    })

    return { success: true }
  },
}
