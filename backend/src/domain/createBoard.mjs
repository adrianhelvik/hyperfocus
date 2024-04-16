// @ts-check

import knex from '../knex.mjs'

/**
 * @param {object} options
 * @param {string} options.createdBy
 * @param {string} options.boardId
 * @param {string} [options.title='']
 */
export default async function createBoard({ createdBy, boardId, title = '' }) {
  await knex('boards').insert({
    createdBy,
    boardId,
    title,
  })
}
