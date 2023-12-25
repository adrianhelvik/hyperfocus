import arrayMove from "util/arrayMove";
import { Deck, Portal } from "./types";

import { createMemo, createSignal } from "solid-js";
import api from "../api";

type Child = Deck | Portal;

function Board({ boardId, fetch }: { boardId: string; fetch: boolean }) {
    const [title, setTitle] = createSignal("");
    const [children, setChildren] = createSignal<Child[]>([]);
    const [color, setColor] = createSignal<string | null>(null);

    if (fetch) {
        api.getBoard({ boardId, children }).then((board: any) => {
            console.log(board);
            setChildren(children);
        });
    }

    const decks = createMemo(() => {
        return children().filter((x) => x.type === "deck");
    });

    const portals = createMemo(() => {
        return children().filter((x) => x.type === "portal");
    });

    const decksById = createMemo(() => {
        const decksById = new Map<string, Child>();

        for (const deck of decks()) {
            decksById.set(deck.deckId, deck);
        }

        return decksById;
    });

    const addDeck = (deck: Deck, index?: number) => {
        setChildren((prevChildren) => {
            if (typeof index !== "number") return prevChildren.concat([deck]);
            const newChildren: Child[] = [];
            for (let i = 0; i < index; i++) {
                newChildren.push(prevChildren[i]);
            }
            newChildren.push(deck);
            for (let i = index; i < prevChildren.length; i++) {
                newChildren.push(prevChildren[i]);
            }
            return newChildren;
        });
    };

    const addPortal = (title: string, deck: Deck) => {
        const portal: Portal = {
            type: "portal",
            title,
            deckId: deck.deckId,
        };
        setChildren((children) => children.concat(portal));
        return portal;
    };

    const move = (fromIndex: number, toIndex: number) => {
        setChildren((children) =>
            arrayMove(children.slice(), fromIndex, toIndex),
        );
    };

    return {
        portals,
        color,
        setColor,
        boardId,
        title,
        setTitle,
        move,
        addPortal,
        addDeck,
        decksById,
        decks,
        get children() {
            return children()
        },
    };
}

export default Board;
