// @ts-check

import knex from '../db.mjs'
import fs from 'fs'

/**
 * @param {string} cardId
 */
export default async function deleteCardImages(cardId) {
  const imageObjects = await knex('cardImages')
    .where({ cardId })

  await Promise.all(imageObjects.map(({ fileName }) => {
    return fs.promises.unlink(`/tmp/${fileName}`);
  }));

  await knex('cardImages')
    .where({ cardId })
    .del()
}
