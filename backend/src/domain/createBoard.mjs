import knex from '../db.mjs'

export default async function createBoard({ createdBy, boardId, title = '' }) {
  await knex('boards').insert({
    createdBy,
    boardId,
    title,
  })
}
