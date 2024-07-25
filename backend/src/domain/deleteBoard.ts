import { deleteUploadedFile } from "./deleteUploadedFile";
import { knex } from "../knex";

export default async function deleteBoard(boardId: string) {
  const decks = await knex("decks").where({ boardId });
  const cardImages = await knex("cardImages")
    .leftJoin("cards", "cardImages.cardId", "cards.cardId")
    .leftJoin("decks", "cards.deckId", "decks.deckId")
    .where("decks.boardId", boardId)
    .select("url")
    .then(res => res.map(item => item.url));

  await knex.transaction(async (trx) => {
    for (const { deckId } of decks) {
      await trx("portals").where({ deckId }).del();
      await trx("cardImages").whereIn("url", cardImages).del();
      await trx("cards").where({ deckId }).del();
    }
    await trx("decks").where({ boardId }).del();
    await trx("portals").where({ boardId }).del();
    await trx("boards").where({ boardId }).del();
  });

  await Promise.all(cardImages.map(url => {
    return deleteUploadedFile(url);
  }));
}
