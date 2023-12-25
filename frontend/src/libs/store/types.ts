export type Deck = {
    type: "deck";
    deckId: string;
    title: string;
    initialFocus?: boolean;
    portals: unknown;
    color: string;
    cards: Card[];
}

export type Portal = {
    type: "portal";
    portalId: string;
    deckId: string;
    title: string;
    portals: Deck[];
    color: string;
    cards: Card[];
};

export type Card = {
}

export type Board = {
};
