import moveBoardChildToIndex from "./domain/moveBoardChildToIndex";
import getDenormalizedBoard from "./domain/getDenormalizedBoard";
import assertCanEditPortal from "./domain/assertCanEditPortal";
import assertCanEditBoard from "./domain/assertCanEditBoard";
import assertCanEditCard from "./domain/assertCanEditCard";
import assertCanEditDeck from "./domain/assertCanEditDeck";
import assertIsVerified from "./domain/assertIsVerified";
import getBoardsForUser from "./domain/getBoardsForUser";
import requireInteger from "./utils/requireInteger";
import addCardImages from "./domain/addCardImages";
import assertIsAdmin from "./domain/assertIsAdmin";
import createProject from "./domain/createProject";
import requireString from "./utils/requireString";
import setCardTitle from "./domain/setCardTitle";
import authenticate from "./domain/authenticate";
import deleteBoard from "./domain/deleteBoard";
import createBoard from "./domain/createBoard";
import createUser from "./domain/createUser";
import deleteCard from "./domain/deleteCard";
import getPortal from "./domain/getPortal";
import addPortal from "./domain/addPortal";
import moveCard from "./domain/moveCard";
import { ServerRoute } from "@hapi/hapi";
import addDeck from "./domain/addDeck";
import getDeck from "./domain/getDeck";
import addCard from "./domain/addCard";
import getCard from "./domain/getCard";
import { ReqWithAuth } from "./types";
import type { Stream } from "stream";
import login from "./domain/login";
import { type UUID } from "crypto";
import uuid from "./utils/uuid";
import Boom from "@hapi/boom";
import { knex } from "./knex";
import Color from "color";
import fs from "fs";

const route = <T extends ServerRoute<object>>(it: T) => it;

export const loginRoute = route({
  method: "POST",
  path: "/login",
  async handler(request: { payload: { username: string, password: string } }) {
    const { username, password } = request.payload;
    const sessionId = await login(username, password)

    return {
      sessionId,
    };
  },
});

export const authenticateRoute = route({
  method: "POST",
  path: "/authenticate",
  async handler(request: { headers: { authorization: string } }) {
    return await authenticate(request);
  },
});

export const createBoardRoute = route({
  method: "POST",
  path: "/createBoard",
  async handler(request: { payload: { title: string }, headers: { authorization: string } }) {
    const { title } = request.payload;
    const { userId } = await authenticate(request);
    const boardId = uuid();

    await assertIsVerified(request);

    await createBoard({
      createdBy: userId,
      boardId,
      title,
    });

    return await getDenormalizedBoard(boardId);
  },
});

export const ownBoardsRoute = route({
  method: "POST",
  path: "/ownBoards",
  async handler(request: { headers: { authorization: string } }) {
    const session = await authenticate(request);
    const boards = await getBoardsForUser(session.userId);

    return { boards };
  },
});

export const getBoardRoute = route({
  method: "POST",
  path: "/getBoard",
  async handler(request: { payload: { boardId: string }, headers: { authorization: string } }) {
    const { boardId } = request.payload;

    if (typeof boardId !== "string")
      throw Boom.badRequest("boardId must be a string");

    await assertCanEditBoard(request, boardId);

    return await getDenormalizedBoard(boardId);
  },
});

export const logoutRoute = route({
  method: "POST",
  path: "/logout",
  async handler(request: { payload: { sessionId: string }, headers: { authorization: string } }) {
    const session = await authenticate(request);

    await knex("sessions").where("sessionId", session.sessionId).del();

    return { success: true };
  },
});

export const addDeckRoute = route({
  method: "POST",
  path: "/addDeck",
  async handler(request: { payload: { boardId: UUID, title: string, index: number }, headers: { authorization: string } }) {
    const { boardId, title, index } = request.payload;

    if (typeof boardId !== "string")
      throw Boom.badRequest("boardId must be a string");

    await assertCanEditBoard(request, boardId);

    const deckId = await addDeck({ boardId, title, index });

    return await getDeck(deckId);
  },
});

export const addPortalRoute = route({
  method: "POST",
  path: "/addPortal",
  async handler(request: { payload: { boardId: UUID, title: string, index: number, deckId: string }, headers: { authorization: string } }) {
    const { boardId, title, index, deckId } = request.payload;

    if (typeof boardId !== "string")
      throw Boom.badRequest("boardId must be a string");

    await assertCanEditBoard(request, boardId);

    const portalId = await addPortal({ boardId, title, index, deckId });

    return await getPortal(portalId);
  },
});

export const addCardRoute = route({
  method: "POST",
  path: "/addCard",
  async handler(request: { payload: { cardId: UUID, title: string, deckId: UUID, index: number } } & ReqWithAuth) {
    const { cardId, title, deckId, index } = request.payload;

    requireString({ title, deckId });

    await assertCanEditDeck(request, deckId);

    await addCard({ cardId, title, deckId, index });

    return { cardId };
  },
});

export const deleteCardRoute = route({
  method: "POST",
  path: "/deleteCard",
  async handler(request: { payload: { cardId: string } } & ReqWithAuth) {
    const { cardId } = request.payload;

    if (!cardId) throw Boom.badRequest("cardId is required");

    await assertCanEditCard(request, cardId);

    await deleteCard(cardId);

    return { success: true };
  },
});

export const moveCardRoute = route({
  method: "POST",
  path: "/moveCard",
  async handler(request: { payload: { cardId: string, target: string, index: number }, headers: { authorization: string } }) {
    const { cardId, target, index } = request.payload;

    requireString({ cardId, target });
    requireInteger({ index });

    const card = await getCard(cardId);

    if (!card) throw Boom.notFound("The card does not exist");

    await assertCanEditBoard(request, card.boardId);

    await moveCard({ cardId, target, index });

    return { success: true };
  },
});

export const moveBoardChildToIndexRoute = route({
  method: "POST",
  path: "/moveBoardChildToIndex",
  async handler(request: { payload: { item: import('./types').BoardChild, index: number, boardId: string }, headers: { authorization: string } }) {
    const { item, index, boardId } = request.payload;

    if (typeof boardId !== "string")
      throw Boom.badRequest("boardId must be a string");

    await assertCanEditBoard(request, boardId);

    await moveBoardChildToIndex({ item, index, boardId });

    return { success: true };
  },
});

export const deleteDeckRoute = route({
  method: "POST",
  path: "/deleteDeck",
  async handler(request: { payload: { deckId: string }, headers: { authorization: string } }) {
    const { deckId } = request.payload;
    const deck = await knex("decks").where({ deckId }).first();

    await assertCanEditBoard(request, deck.boardId);

    await knex("decks").where({ deckId }).del();

    return { success: true };
  },
});

export const deletePortalRoute = route({
  method: "POST",
  path: "/deletePortal",
  async handler(request: { payload: { portalId: string }, headers: { authorization: string } }) {
    const { portalId } = request.payload;

    if (typeof portalId !== "string")
      throw Boom.badRequest("Please provide a portalId");

    const portal = await knex("portals").where({ portalId }).first();

    if (!portal)
      throw Boom.badRequest("No portal with the given portalId exists");

    await assertCanEditBoard(request, portal.boardId);

    await knex("portals").where({ portalId }).del();

    return { success: true };
  },
});

export const deleteBoardRoute = route({
  method: "POST",
  path: "/deleteBoard",
  async handler(request: { payload: { boardId: string }, headers: { authorization: string } }) {
    const { boardId } = request.payload;
    await assertCanEditBoard(request, boardId);

    await deleteBoard(boardId);

    return { success: true };
  },
});

export const setDeckColorRoute = route({
  method: "POST",
  path: "/setDeckColor",
  async handler(request: { payload: { deckId: string, color: string } } & ReqWithAuth) {
    const { deckId, color } = request.payload;
    await assertCanEditDeck(request, deckId);

    await knex("decks").where({ deckId }).update({ color });

    return { success: true };
  },
});

export const setBoardColorRoute = route({
  method: "POST",
  path: "/setBoardColor",
  async handler(request: { payload: { boardId: string, color: string | null }, headers: { authorization: string } }) {
    let { boardId, color } = request.payload;
    await assertCanEditBoard(request, boardId);

    if (!["null", "string"].includes(typeof color)) {
      throw Boom.badRequest("Invalid color");
    }

    if (color != null) color = Color(color).hex();

    await knex("boards").where({ boardId }).update({ color });

    return { success: true };
  },
});

export const setBoardTitleRoute = route({
  method: "POST",
  path: "/setBoardTitle",
  async handler(request: { payload: { boardId: string, title: string }, headers: { authorization: string } }) {
    const { boardId, title } = request.payload;
    await assertCanEditBoard(request, boardId);

    await knex("boards").where({ boardId }).update({ title });

    return { success: true };
  },
});

export const setDeckTitleRoute = route({
  method: "POST",
  path: "/setDeckTitle",
  async handler(request: { payload: { deckId: string, title: string } } & ReqWithAuth) {
    const { deckId, title } = request.payload;
    await assertCanEditDeck(request, deckId);

    await knex("decks").where({ deckId }).update({ title });

    return { success: true };
  },
});

export const setPortalTitleRoute = route({
  method: "POST",
  path: "/setPortalTitle",
  async handler(request: { payload: { portalId: string, title: string } } & ReqWithAuth) {
    const { portalId, title } = request.payload;
    await assertCanEditPortal(request, portalId);

    await knex("portals").where({ portalId }).update({ title });

    return { success: true };
  },
});

export const registerUserRoute = route({
  method: "POST",
  path: "/registerUser",
  async handler(request: { payload: { email: string, password: string } }) {
    const { email, password } = request.payload;

    requireString({ email, password });

    await createUser({
      password,
      email,
    });

    return {
      sessionId: await login(email, password),
    };
  },
});

export const createProjectRoute = route({
  method: "POST",
  path: "/createProject",
  async handler(request: { payload: { title: string }, headers: { authorization: string } }) {
    const { title } = request.payload;
    const { userId } = await authenticate(request);

    await assertIsVerified(request);

    const projectId = await createProject({
      createdBy: userId,
      title,
    });

    return { projectId };
  },
});

export const addCardImagesRoute = route({
  method: "POST",
  path: "/addCardImages",
  options: {
    payload: {
      parse: true,
      allow: "multipart/form-data",
      maxBytes: 100 * 1024 ** 3,
      multipart: {
        output: "stream",
      },
    },
  },
  async handler(request: { payload: { cardId: UUID, image: Stream | Array<Stream> }, headers: { authorization: string } }) {
    try {
      const cardId = request.payload.cardId;
      const images = Array.isArray(request.payload.image)
        ? request.payload.image
        : [request.payload.image].filter(Boolean);

      return await addCardImages(cardId, images);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
});

export const uploadsRoute = route({
  method: "GET",
  path: "/uploads/{fileName}",
  async handler(request: { params: { fileName: string } }) {
    return fs.createReadStream(`/tmp/${request.params.fileName}`);
  },
});

export const setCardTitleRoute = route({
  method: "POST",
  path: "/setCardTitle",
  async handler(request: { payload: { cardId: string, title: string } } & ReqWithAuth) {
    const { cardId, title } = request.payload;

    await assertCanEditCard(request, cardId);

    await setCardTitle({ cardId, title });

    return {
      success: true,
    };
  },
});

export const getUserStatsRoute = route({
  method: "POST",
  path: "/getUserStats",
  async handler(request: ReqWithAuth) {
    await assertIsAdmin(request);

    const usersQuery = knex("users")
      .select("userId", "email")

    const result: any[] = [];

    for await (const user of usersQuery.stream()) {
      result.push(user);
      user.boardCount = await knex("boards")
        .where({ createdBy: user.userId })
        .count("*")
        .then(res => Number(res[0].count));
      user.cardCount = await knex("cards")
        .leftJoin("decks", "decks.deckId", "cards.deckId")
        .leftJoin("boards", "boards.boardId", "decks.boardId")
        .where("boards.createdBy", user.userId)
        .count("*")
        .then(res => Number(res[0].count));
    }

    console.log(result);

    return result;
  }
})
