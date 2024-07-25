import { knex } from "../knex";
import fs from "fs";

export default async function deleteCardImages(cardId: string) {
  const imageObjects = await knex("cardImages").where({ cardId });

  await Promise.all(
    imageObjects.map(({ fileName }) => {
      return fs.promises.unlink(`/tmp/${fileName}`);
    })
  );

  await knex("cardImages").where({ cardId }).del();
}
