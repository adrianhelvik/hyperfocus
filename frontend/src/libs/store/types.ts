import type BoardFactory from "./Board";

export type Deck = {
    type: "deck";
    deckId: string;
    title: string;
    initialFocus?: boolean;
}

export type Portal = {
    type: "portal";
    portalId: string;
    deckId: string;
    title: string;
};

export type Card = {
}

export type Board = ReturnType<typeof BoardFactory>;
