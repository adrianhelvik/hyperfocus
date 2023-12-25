import { styled } from "solid-styled-components";
import showModal from "showModal";
import AddPortal from "./AddPortal";
import AddCircle from "./AddCircle";
import Loading from "ui/Loading";
import AddDeck from "./AddDeck";
import Header from "ui/Header";
import * as theme from "theme";
import Portal from "./Portal";
import confirm from "confirm";
import Deck from "./Deck";
import api from "api";
import { For, createEffect, createMemo, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import showMenu from "showMenu";
import { Board } from "store/types";
import { board, setBoard } from "store";

export default function PossiblyRenderBoard() {
    const params = useParams();

    createEffect(() => {
        api.getBoard({ boardId: params.boardId }).then((board: any) => {
            console.log("Board:", board);
            setBoard(board);
        });
    });

    return <>{!board() ? <Loading /> : <BoardView board={board()} />}</>;
}

function BoardView(props: { board: Board }) {
    const board: () => Board = () => props.board;
    const [fromIndex, setFromIndex] = createSignal<number | null>(null);
    const [toIndex, setToIndex] = createSignal<number | null>(null);

    const addDeck = async () => {
        await showModal((props: any) => <AddDeck {...props} board={board} />);
    };

    const addDeckFromContextMenu = async (event: MouseEvent) => {
        const { clientX } = event;

        const index = insertionPointForChild(clientX);

        await showModal((props) => <AddDeck {...props} index={index} />);
    };

    const addPortalFromContextMenu = async (event: MouseEvent) => {
        const { clientX } = event;

        const index = insertionPointForChild(clientX);

        await showModal((props) => <AddPortal {...props} index={index} />, {
            width: 700,
        });
    };

    const insertionPointForChild = (x: number) => {
        const deckElements = document.querySelectorAll("[data-board-child]");

        if (!deckElements.length) return 0;

        let i = -1;
        while (
            deckElements[++i] &&
            deckElements[i].getBoundingClientRect().left +
                deckElements[i].getBoundingClientRect().width / 2 <
                x
        );

        return i;
    };

    const addPortal = async () => {
        await showModal((props) => <AddPortal {...props} />, {
            width: 700,
        });
    };

    const simulateMove = (_newFromIndex: number, _newToIndex: number) => {
        // TODO
    };

    const shouldIndexMoveRight = (index: number) => {
        const from = fromIndex();
        const to = toIndex();
        if (from == null || to == null) return false;
        return to < from && index >= to && index < from;
    };

    const moveRight = createMemo(() => {
        const moveRight = [];
        for (let i = 0; i < board().children.length ?? 0; i++)
            if (shouldIndexMoveRight(i)) moveRight.push(i);
        return moveRight;
    });

    const shouldIndexMoveLeft = (index: number) => {
        const from = fromIndex();
        const to = toIndex();
        if (from == null || to == null) return false;
        return to > from && index > from && index <= to;
    };

    const moveLeft = createMemo(() => {
        const moveLeft = [];
        for (let i = 0; i < board().children.length; i++)
            if (shouldIndexMoveLeft(i)) moveLeft.push(i);
        return moveLeft;
    });

    const move = (fromIndex: number, toIndex: number) => {
        let item: any = board().children[fromIndex];

        if (item.type === "portal")
            item = { type: "portal", portalId: item.portalId };
        else if (item.type === "deck")
            item = { type: "deck", deckId: item.deckId };
        else {
            console.error("Invalid type:", item);
            throw Error("Invalid type. Check log");
        }

        board().move(fromIndex, toIndex);

        api.moveBoardChildToIndex({
            boardId: board().boardId,
            index: toIndex,
            item,
        });
    };

    const onContextMenu = (event: any) => {
        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        )
            return;
        event.preventDefault();
        showMenu(event, {
            "Add deck": (event: MouseEvent) => {
                addDeckFromContextMenu(event);
            },
            "Add portal": (event: MouseEvent) => {
                addPortalFromContextMenu(event);
            },
        });
    };

    return (
        <Container onContextMenu={onContextMenu}>
            <Header color={board().color}>
                <Breadcrumbs>
                    <GoBack
                        onClick={() => {
                            window.location.href = "/app";
                        }}
                    >
                        My boards
                    </GoBack>
                    <div>›</div>
                    <Title>{board().title}</Title>
                </Breadcrumbs>
            </Header>
            <Decks class="board-decks">
                {board().children.length === 0 && (
                    <Empty>
                        There are no decks here yet.
                        <br />
                        Click{" "}
                        <span class="material-symbols-outlined">
                            add_circle
                        </span>{" "}
                        to create your first deck!
                    </Empty>
                )}
                <For each={board().children}>
                    {(child, index) => {
                    console.log("child:", child);
                        const props = {
                            //childContainer: childContainer,
                            simulateMove: simulateMove,
                            moveRight: moveRight().includes(index()),
                            moveLeft: moveLeft().includes(index()),
                            move: move,
                            index: index,
                        };

                        if (child.type === "portal") {
                            return (
                                <Portal
                                    delete={async () => {
                                        const confirmed = await confirm(
                                            ({ yes, no }) => (
                                                <div>
                                                    <div>Delete portal</div>
                                                    <button onClick={yes}>
                                                        Delete
                                                    </button>
                                                    <button onClick={no}>
                                                        Keep
                                                    </button>
                                                </div>
                                            ),
                                        );
                                        if (!confirmed) return;
                                        api.deletePortal({
                                            portalId: child.portalId,
                                        });
                                        board.children.splice(index(), 1);
                                    }}
                                    portal={child}
                                    {...props}
                                />
                            );
                        }

                        return (
                            <Deck
                                delete={async () => {
                                    const confirmed = await confirm(
                                        ({ yes, no }) => (
                                            <div>
                                                <div>Delete deck</div>
                                                <div>
                                                    All cards in the deck will
                                                    be deleted as well.
                                                </div>
                                                <button onClick={yes}>
                                                    Delete
                                                </button>
                                                <button onClick={no}>
                                                    Keep
                                                </button>
                                            </div>
                                        ),
                                    );
                                    if (!confirmed) return;
                                    api.deleteDeck({
                                        deckId: child.deckId,
                                    });
                                    board.children.splice(index(), 1);
                                }}
                                key={child.deckId}
                                deck={child}
                                {...props}
                            />
                        );
                    }}
                </For>
            </Decks>
            <AddCircle>
                <AddItem onClick={addDeck}>
                    <AddItemText>Add Deck</AddItemText>
                </AddItem>
                <AddItem onClick={addPortal}>
                    <AddItemText>Add portal</AddItemText>
                </AddItem>
            </AddCircle>
        </Container>
    );
}

const Container = styled.main`
    background: #ddd;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
`;

const Breadcrumbs = styled.header`
    display: flex;
    align-items: start;
    gap: 10px;
`;

const Title = styled.div`
    display: inline-block;
`;

const AddItem = styled.div`
    background: ${theme.ui1};
    cursor: pointer;
    transition: 0.3s;
    &:hover {
        background: ${theme.ui2};
    }
    padding: 10px;
    height: 55px;
    display: flex;
    align-items: flex-start;

    :first-child {
        border-top-left-radius: 4px;
    }
`;

const AddItemText = styled.div`
    margin: auto;
    color: white;
`;

const Decks = styled.div`
    display: flex;
    overflow: auto;
    flex-grow: 1;
    padding-bottom: 100px;
    align-items: flex-start;
`;

const GoBack = styled.button`
    background: transparent;
    font-size: inherit;
    padding: 0;
    margin: 0;
    border: none;
    cursor: pointer;
    color: inherit;
`;

const Empty = styled.div`
    text-align: center;
    font-size: 30px;
    user-select: none;
    text-align: center;
    color: ${theme.placeholderGray};
    margin: 0 auto;
    margin-top: 100px;
    line-height: 1.5;
    > span {
        font-size: 30px;
        position: relative;
        top: 5px;
    }
`;
