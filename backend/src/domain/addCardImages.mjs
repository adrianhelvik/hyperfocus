// @ts-check

import { randomUUID } from 'crypto'
import knex from '../db.mjs'
import fs from "fs";
import { Stream } from 'stream';
import assert from 'assert';

const UPLOADS_BASE_URL = process.env.UPLOADS_BASE_URL;
assert(UPLOADS_BASE_URL, "UPLOADS_BASE_URL is required");

/**
 * @param {string} cardId
 * @param {Stream[]} images
 * @returns void
 */
export default async function addCardImages(cardId, images) {
  const entries = [];

  await Promise.all(images.map((stream, index) => {
    const fileName = `${cardId}_${randomUUID()}`;
    const url = UPLOADS_BASE_URL + `/uploads/${fileName}`;
    entries.push({
      fileName,
      cardId,
      url,
      index,
    });
    return fs.promises.writeFile(`/tmp/${fileName}`, stream);
  }));

  await knex('cardImages').insert(entries);

  return entries.map(entry => entry.url);
}
