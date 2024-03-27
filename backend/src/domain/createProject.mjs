// @ts-check

import knex from '../db.mjs'
import uuid from '../utils/uuid.mjs'

/**
 * @param {object} options
 * @param {string} options.createdBy
 * @param {string} options.title
 * @returns {Promise<string>}
 */
export default async function createProject({ createdBy, title }) {
  const projectId = uuid()
  await knex('projects').insert({
    createdBy,
    projectId,
    title,
  })
  return projectId
}
