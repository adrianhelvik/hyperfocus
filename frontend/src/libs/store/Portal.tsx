import { observable } from "mobx";
import Deck, { DeckParam } from "./Deck";

export type PortalParam = {
  boardId?: string;
  portalId?: string;
  type?: "portal";
  target: Deck | DeckParam | null;
};

class Portal {
  @observable title = "";
  @observable target: Deck | DeckParam | null = null;
  portalId: string;
  index: number;

  type = "portal";
  boardTitle: string;

  constructor(param: PortalParam) {
    Object.assign(this, param);
  }
}

export default Portal;
