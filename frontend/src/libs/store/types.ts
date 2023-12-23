export type Deck = {
    type: "deck";
    deckId: string;
    title: string;
}

export type Portal = {
    type: "portal";
    deckId: string;
    title: string;
};

export type Board = {
    color: string;
    boardId: string
    title: string;
}

export type Card = {
}
