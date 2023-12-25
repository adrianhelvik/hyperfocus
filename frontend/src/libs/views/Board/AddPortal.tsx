import { styled, css } from "solid-styled-components";
import { Board } from "src/libs/store/types";
import ModalFooter from "ui/ModalFooter";
import onSelect from "util/onSelect";
import ellipsify from "ellipsify";
import Button from "ui/Button";
import * as theme from "theme";
import * as store from "store";
import Input from "ui/Input";
import Help from "ui/Help";
import { Deck } from "store/types";
import { For, createSignal } from "solid-js";

export default function AddPortal(props: {
    index?: number;
    resolve: () => void;
}) {
    const [title, setTitle] = createSignal("");
    const [board, setBoard] = createSignal<Board | null>(null);
    const [deck, setDeck] = createSignal<Deck | null>(null);

    // TODO: Signal fetching own boards

    const onSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        if (!board() || !deck() || !title()) return;
        store.board()!.addPortal(title()!, deck()!);
        props.resolve();
    };

    return (
        <form onSubmit={onSubmit}>
            <MainTitle>
                Create portal{" "}
                <Help iconStyle={{ fontSize: "25px" }}>
                    A portal is a link to a deck from another board. With
                    portals it becomes easier to move cards from one board to
                    another.
                </Help>
            </MainTitle>
            <InputWrapper>
                <Input
                    placeholder="Name in this board"
                    autoFocus
                    value={title}
                    onChange={setTitle}
                />
            </InputWrapper>
            <Sections>
                <Section>
                    <Title>Select board</Title>
                    <For each={store.boards()}>
                        {(b) => (
                            <Tile
                                type="button"
                                $selected={board() === b}
                                $empty={b.decks.length === 0}
                                {...onSelect(() => setBoard(b))}
                            >
                                {ellipsify(b.title() || "Untitled")}
                            </Tile>
                        )}
                    </For>
                </Section>
                <Section>
                    <Title>Select Deck</Title>
                    {board() &&
                        board()!
                            .decks()
                            .map((d) => (
                                <Tile
                                    type="button"
                                    $selected={d === deck()}
                                    {...onSelect(() => setDeck(deck))}
                                >
                                    {ellipsify(deck()!.title || "Untitled")}
                                </Tile>
                            ))}
                </Section>
            </Sections>
            <hr />
            <ModalFooter>
                <Button $gray onClick={() => props.resolve()}>
                    Cancel
                </Button>
                <Button disabled={!board() || !deck() || !title()}>
                    Create portal
                </Button>
            </ModalFooter>
        </form>
    );
}

const Sections = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
`;

const Tile = styled.button<{ $selected?: boolean; $empty?: boolean }>`
    width: 100%;
    border: 1px solid transparent;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 10px;
    border-radius: 4px;
    background: #ddd;
    :not(:last-child) {
        margin-bottom: 10px;
    }
    :focus {
        outline: none;
        border-color: #707070;
    }
    :active:hover {
        background: #707070;
        color: white;
    }

    ${(p) =>
        p.$selected
            ? css`
                  background: ${theme.ui1};
                  color: white;
              `
            : ""};

    ${(p) =>
        p.$empty
            ? css`
                  opacity: 0.5;
              `
            : ""}
`;

const Section = styled.section`
    :not(:last-child) {
        margin-right: 10px;
    }
    min-width: 200px;
    min-height: 400px;
    max-height: calc(100vh - 400px);
    overflow: auto;
`;

const Title = styled.div`
    font-size: 0.8rem;
    color: #707070;
    border-bottom: 1px solid #707070;
    margin-bottom: 10px;
`;

const InputWrapper = styled.div`
    padding-bottom: 10px;
    margin-bottom: 10px;
`;

const MainTitle = styled.h2`
    margin: 0;
    margin-bottom: 30px;
    color: #333;
    font-size: 1.5rem;
    font-weight: normal;
`;
