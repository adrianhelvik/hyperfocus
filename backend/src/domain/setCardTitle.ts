import { knex } from "../knex";

export default async function setCardTitle({ cardId, title }: { cardId: string, title: string }) {
  await knex("cards")
    .where({ cardId })
    .update({ title });
}
