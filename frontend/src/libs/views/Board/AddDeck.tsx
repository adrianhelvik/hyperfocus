import ModalFooter from "ui/ModalFooter";
import { styled } from "solid-styled-components";
import Button from "ui/Button";
import Input from "ui/Input";
import api from "api";
import { createSignal } from "solid-js";
import * as store from "store";

type Props = {
    resolve: () => void;
    index: number;
};

export default function AddDeck(props: Props) {
    const [loading, setLoading] = createSignal(false);
    const [title, setTitle] = createSignal("");

    const onSubmit = async (event: SubmitEvent) => {
        if (loading()) return;
        setLoading(true);
        event.preventDefault();
        const { deckId } = await api.addDeck({
            boardId: store.board()!.boardId,
            title: title(),
            index: props.index,
        });
        const deck = {
            deckId,
            type: "deck" as const,
            boardId: store.board()!.boardId,
            portals: [],
            title: title(),
        };
        store.patchDeck(deckId, { initialFocus: true });
        store.board()!.addDeck(deck, props.index);
        props.resolve();
    };

    return (
        <Container onSubmit={onSubmit}>
            <Title>Create a deck</Title>
            <Input
                autoFocus
                placeholder="Title"
                onChange={setTitle}
                value={title}
            />
            <ModalFooter>
                <Button $gray type="button" onClick={() => props.resolve()}>
                    Cancel
                </Button>
                <Button>Create</Button>
            </ModalFooter>
        </Container>
    );
}

const Container = styled.form``;

const Title = styled.h2`
    margin: 0;
    margin-bottom: 30px;
    color: #333;
    font-size: 1.5rem;
    font-weight: normal;
`;
