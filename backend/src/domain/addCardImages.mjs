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
  const fileNames = [];

  await Promise.all(images.map(stream => {
    const fileName = `${cardId}_${randomUUID()}`;
    fileNames.push(fileName);
    return fs.promises.writeFile(`/tmp/${fileName}`, stream);
  }));

  const urls = fileNames.map(fileName => UPLOADS_BASE_URL + `/uploads/${fileName}`);

  await knex('cardImages').insert(urls.map((url, index) => ({
    cardId,
    url,
    index,
  })));

  return urls;
}
