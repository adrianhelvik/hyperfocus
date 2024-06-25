// @ts-check

import uuid from "../utils/uuid.mjs";
import isInteger from "is-integer";
import knex from "../knex.mjs";

/**
 * @param {object} args
 * @param {string} args.title
 * @param {string} args.cardId
 * @returns {Promise<void>}
 */
export default async function setCardTitle({ cardId, title }) {
  await knex("cards")
    .where({ cardId })
    .update({ title });
}
