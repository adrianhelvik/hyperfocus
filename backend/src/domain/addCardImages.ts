import { type UUID, randomUUID } from "crypto";
import { type Stream } from "stream";
import { knex } from "../knex";
import assert from "assert";
import fs from "fs";

const UPLOADS_BASE_URL = process.env.UPLOADS_BASE_URL;
assert(UPLOADS_BASE_URL, "UPLOADS_BASE_URL is required");

/**
 * @param {string} cardId
 * @param {Stream[]} images
 * @returns void
 */
export default async function addCardImages(cardId: UUID, images: Stream[]) {
  // TODO: Improve typing
  const entries: any[] = [];

  await Promise.all(
    images.map((stream, index) => {
      // TODO: Add support for non-local files
      const fileName = `${cardId}_${randomUUID()}`;
      const url = UPLOADS_BASE_URL + `/uploads/${fileName}`;
      entries.push({
        fileName,
        cardId,
        url,
        index,
      });
      console.log(`Uploaded file: ${fileName}`);
      return fs.promises.writeFile(`/tmp/${fileName}`, stream);
    })
  );

  await knex("cardImages").insert(entries);

  return entries.map((entry) => entry.url);
}
