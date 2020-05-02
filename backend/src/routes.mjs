import moveBoardChildToIndex from './libs/moveBoardChildToIndex.mjs'
import getDenormalizedBoard from './libs/getDenormalizedBoard.mjs'
import assertCanEditPortal from './libs/assertCanEditPortal.mjs'
import assertCanEditBoard from './libs/assertCanEditBoard.mjs'
import assertCanEditDeck from './libs/assertCanEditDeck.mjs'
import assertIsVerified from './libs/assertIsVerified.mjs'
import getBoardsForUser from './libs/getBoardsForUser.mjs'
import requireInteger from './libs/requireInteger.mjs'
import createSession from './libs/createSession.mjs'
import requireString from './libs/requireString.mjs'
import authenticate from './libs/authenticate.mjs'
import createBoard from './libs/createBoard.mjs'
import createHash from './libs/createHash.mjs'
import createUser from './libs/createUser.mjs'
import isInteger from 'is-integer'
import moveCard from './libs/moveCard.mjs'
import Boom from '@hapi/boom'
import getCard from './libs/getCard.mjs'
import getUser from './libs/getUser.mjs'
import assert from 'assert'
import login from './libs/login.mjs'
import uuid from './uuid.mjs'
import knex from './libs/db.mjs'

export const homeRoute = {
  method: 'GET',
  path: '/',
  handler(request, reply) {
    return 'Welcome!'
  }
}

export const loginRoute = {
  method: 'POST',
  path: '/login',
  async handler(request, reply) {
    const { username, password } = request.payload
    const sessionId = await login(username, password)

    return {
      sessionId
    }
  }
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
  }
}

export const ownBoardsRoute = {
  method: 'POST',
  path: '/ownBoards',
  async handler(request, reply) {
    const session = await authenticate(request)
    const boards = await getBoardsForUser(session.userId)

    return {boards}
  }
}

export const getBoardRoute = {
  method: 'POST',
  path: '/getBoard',
  async handler(request, reply) {
    const session = await authenticate(request)
    const {boardId} = request.payload

    if (typeof boardId !== 'string')
      throw Boom.badRequest('boardId must be a string')

    await assertCanEditBoard(request, boardId)

    return await getDenormalizedBoard(boardId)
  }
}

export const logoutRoute = {
  method: 'POST',
  path: '/logout',
  async handler(request, reply) {
    const session = await authenticate(request)

    await knex('sessions')
      .where('sessionId', session.sessionId)
      .del()

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

      await Promise.all(updates.map(async ([{type, ...child}, i]) => {
        switch (type) {
          case 'insert': {
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
          case 'deck': {
            await knex('decks')
            .where('deckId', child.deckId)
            .update('index', i)
          }
            break
          case 'portal': {
            await knex('portals')
            .where('portalId', child.portalId)
            .update('index', i)
          }
            break
          default: {
            throw Error(`Could not update index for child of type: ${child.type}`)
          }
        }
      }))
    })

    return {deckId}
  }
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

      await Promise.all(updates.map(async ([{type, ...child}, i]) => {
        switch (type) {
          case 'insert': {
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
          case 'deck': {
            await knex('decks')
            .where('deckId', child.deckId)
            .update('index', i)
          }
            break
          case 'portal': {
            await knex('portals')
            .where('portalId', child.portalId)
            .update('index', i)
          }
            break
          default: {
            throw Error(`Could not update index for child of type: ${child.type}`)
          }
        }
      }))
    })

    return {portalId}
  }
}

export const addCardRoute = {
  method: 'POST',
  path: '/addCard',
  async handler(request, reply) {
    const session = await authenticate(request)
    const {title, deckId} = request.payload

    if (typeof deckId !== 'string')
      throw Boom.badRequest('deckId must be a string')

    if (typeof title !== 'string')
      throw Boom.badRequest('title must be a string')

    const {boardId} = await knex('decks')
      .where({deckId})
      .first()

    await assertCanEditBoard(request, boardId)

    const cards = await knex('cards')
      .where({deckId})
      .orderBy('index', 'asc')

    const index = ! isInteger(request.payload.index)
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
          await knex('cards')
            .insert(card)
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

    return {cardId}
  }
}

export const deleteCardRoute = {
  method: 'POST',
  path: '/deleteCard',
  async handler(request, reply) {
    const {cardId} = request.payload

    if (! cardId)
      throw Boom.badRequest('cardId is required')

    const card = await knex('cards')
      .where({cardId})
      .leftJoin('decks', 'cards.deckId', 'decks.deckId')
      .first()

    if (! card)
      throw Boom.notFound('The card does not exist')

    await assertCanEditBoard(request, card.boardId)

    console.log(card.index)

    await knex.transaction(async knex => {
      await knex('cards')
        .where('deckId', card.deckId)
        .andWhere(
          'index',
          '>',
          knex('cards')
          .where('cardId', cardId)
          .select('index')
        )
        .andWhere('cardId', '!=', cardId)
        .decrement('index')
        .catch(e => {
          throw Error(e.message)
        })

      await knex('cards')
        .where({cardId})
        .del()
    })

    return {success: true}
  }
}

export const moveCardRoute = {
  method: 'POST',
  path: '/moveCard',
  async handler(request) {
    const {cardId, source, target, index} = request.payload

    requireString({cardId, source, target})
    requireInteger({index})

    const card = await getCard(cardId)

    if (! card)
      throw Boom.notFound('The card does not exist')

    if (card.deckId !== source)
      throw Boom.badRequest('Card did not belong to the source deck')

    await assertCanEditBoard(request, card.boardId)

    await moveCard({cardId, source, target, index})

    return { success: true }
  }
}

export const moveBoardChildToIndexRoute = {
  method: 'POST',
  path: '/moveBoardChildToIndex',
  async handler(request) {
    const {item, index, boardId} = request.payload

    if (typeof boardId !== 'string')
      throw Boom.badRequest('boardId must be a string')

    await assertCanEditBoard(request, boardId)

    await moveBoardChildToIndex({item, index, boardId})

    return {success: true}
  }
}

export const deleteDeckRoute = {
  method: 'POST',
  path: '/deleteDeck',
  async handler(request) {
    const {deckId} = request.payload
    const deck = await knex('decks')
      .where({deckId})
      .first()

    await assertCanEditBoard(request, deck.boardId)

    await knex('decks')
      .where({deckId})
      .del()

    return {success: true}
  }
}

export const deletePortalRoute = {
  method: 'POST',
  path: '/deletePortal',
  async handler(request) {
    const {portalId} = request.payload

    if (typeof portalId !== 'string')
      throw Boom.badRequest('Please provide a portalId')

    const portal = await knex('portals')
      .where({portalId})
      .first()

    if (! portal)
      throw Boom.badRequest('No portal with the given portalId exists')

    await assertCanEditBoard(request, portal.boardId)

    await knex('portals')
      .where({portalId})
      .del()

    return {success: true}
  }
}

export const deleteBoardRoute = {
  method: 'POST',
  path: '/deleteBoard',
  async handler(request) {
    const {boardId} = request.payload
    const user = await authenticate(request)

    const deleted = await knex('boards')
      .where({boardId})
      .andWhere({createdBy: user.userId})
      .del()

    if (deleted)
      return {success: true}
    else
      throw Boom.notFound('No accessible board with the given id')
  }
}

export const setDeckColorRoute = {
  method: 'POST',
  path: '/setDeckColor',
  async handler(request) {
    const {deckId, color} = request.payload
    const session = await authenticate(request)

    await knex('decks')
      .where({deckId})
      .update({color})

    return {success: true}
  }
}

export const setDeckTitleRoute = {
  method: 'POST',
  path: '/setDeckTitle',
  async handler(request) {
    const {deckId, title} = request.payload
    await assertCanEditDeck(request, deckId)

    await knex('decks')
      .where({deckId})
      .update({title})

    return {success: true}
  }
}

export const setPortalTitleRoute = {
  method: 'POST',
  path: '/setPortalTitle',
  async handler(request) {
    const {portalId, title} = request.payload
    await assertCanEditPortal(request, portalId)

    await knex('portals')
      .where({portalId})
      .update({title})

    return {success: true}
  }
}

export const registerUserRoute = {
  method: 'POST',
  path: '/registerUser',
  async handler(request) {
    const {email, password} = request.payload

    requireString({email, password})

    await createUser({
      password,
      email,
    })

    return {success: true}
  }
}
