import assertCanEditDeck from "./assertCanEditDeck";
import { ReqWithAuth } from "../types";
import getCard from "./getCard";
import Boom from "@hapi/boom";

export default async function assertCanEditCard(request: ReqWithAuth, cardId: string) {
  const card = await getCard(cardId);

  if (!card) throw Boom.notFound("The card does not exist");

  await assertCanEditDeck(request, card.deckId);
}
