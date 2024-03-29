import arrayMove from "src/libs/util/arrayMove";
import Deck, { DeckParam } from "./Deck";
import { v4 as uuid } from "uuid";
import Portal from "./Portal";

import { observable, computed, action } from "mobx";

export type BoardParam = {
    title: string;
    children: (Deck | Portal)[];
    boardId: string;
    color: string;
};

class Board {
    @observable title = "";
    @observable children = [];
    @observable boardId = null;
    @observable color = null;

    constructor(arg: BoardParam | string) {
        if (typeof arg === "string") this.fromTitle(arg);
        else this.fromBoard(arg);
    }

    fromBoard(board: BoardParam) {
        this.title = board.title;
        this.children = board.children.slice();
        this.boardId = board.boardId;
        this.color = board.color;
    }

    fromTitle(title: string) {
        this.title = title;
        this.boardId = uuid();
    }

    @computed get decks() {
        return this.children.filter((x) => x instanceof Deck);
    }

    @computed get portals() {
        return this.children.filter((x) => x instanceof Portal);
    }

    @computed get decksById() {
        const decksById = observable.map();

        for (const deck of this.decks) decksById.set(deck.deckId, deck);

        return decksById;
    }

    @action addDeck(deck: DeckParam, index: number) {
        if (typeof index === "number") this.children.splice(index, 0, deck);
        else this.children.push(deck);
    }

    @action addPortal(options: {
        boardId?: string;
        deckId?: string;
        index?: number;
        portalId?: string;
        title: string;
        target: DeckParam;
    }) {
        const portal = new Portal(options);
        this.children.push(portal);
        return portal;
    }

    @action move(fromIndex: number, toIndex: number) {
        arrayMove(this.children, fromIndex, toIndex);
    }
}

export default Board;
