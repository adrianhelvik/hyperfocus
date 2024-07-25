import local from "src/libs/local";
import { Board, BoardParam, Deck, Portal, Project, User } from "./types";

let persistentHeaders = local.get("persistentHeaders", {});

type Api = {
  setBoardTitle(payload: { boardId: string; title: string }): Promise<void>;
  setCardTitle(payload: { cardId: string; title: string }): Promise<void>;
  ownProjects(): Promise<{ projects: Project[] }>;
  createBoard(board: BoardParam): Promise<Board>;
  registerUser(payload: { password: string; email: string }): Promise<{ sessionId: string }>;
  deleteDeck(payload: { deckId: string }): Promise<void>;
  deletePortal(payload: { portalId: string }): Promise<void>;
  moveBoardChildToIndex(payload: {
    boardId: string;
    index: number;
    item: Deck | Portal;
  }): unknown;
  setDeckTitle(payload: { deckId: string; title: string }): Promise<void>;
  setPortalTitle(payload: { portalId: string; title: string }): Promise<void>;
  deleteCard(payload: { cardId: string }): Promise<void>;
  moveCard(payload: { cardId: string; target: any; index: number }): unknown;
  addDeck(payload: {
    boardId: string;
    title: string;
    index: number;
  }): PromiseLike<Deck>;
  setDeckColor(payload: { deckId: string; color: string }): unknown;
  addCard(payload: {
    title: string;
    deckId: string;
  }): PromiseLike<{ cardId: string }>;
  logout(): PromiseLike<void>;
  authenticate(): PromiseLike<void>;
  login(payload: {
    username: string;
    password: string;
  }): PromiseLike<{ sessionId: string }>;
  getBoard(payload: { boardId: string }): PromiseLike<Board>;
  deleteBoard(payload: { boardId: string }): PromiseLike<void>;
  setBoardColor(payload: { boardId: string, color: string | null }): PromiseLike<void>;
  addPortal(options: {
    boardId: string;
    deckId: string;
    index: number | null;
    title: string;
  }): PromiseLike<Portal>;
  ownBoards: () => PromiseLike<{ boards: Board[] }>;
  getUsers: () => PromiseLike<{ users: User[] }>;
};

export async function addCardImages(cardId: string, images: File[]) {
  console.log("persistentHeaders:", persistentHeaders);

  const formData = new FormData();

  formData.append("cardId", cardId);
  for (const image of images) {
    formData.append("image", image);
  }

  console.log(formData);

  const response = await fetch("/api/addCardImages", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      ...persistentHeaders,
      Accept: "application/json",
    },
    redirect: "follow",
    referrer: "no-referrer",
    body: formData,
  });

  return response.json();
}

export default new Proxy({} as any, {
  get(_: any, name: string) {
    return (body: any) => callProcedure(name, body);
  },
}) as Api;

async function callProcedure(name: string, body = {}) {
  body = { ...body };

  const headers = {
    "Content-Type": "application/json",
    ...persistentHeaders,
  };

  try {
    var response = await fetch(`/api/${name}`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers,
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error(`Failed to call procedure "${name}"`, {
      headers,
      body,
    });
    throw e;
  }

  const data = await response.json();

  if (String(response.status)[0] !== "2") throw Error(data.message);

  return data;
}

export function setPersistentHeader(key: string, value: string) {
  local.set("persistentHeaders", {
    ...local.get("persistentHeaders", {}),
    [key]: value,
  });

  persistentHeaders = local.get("persistentHeaders");
}
