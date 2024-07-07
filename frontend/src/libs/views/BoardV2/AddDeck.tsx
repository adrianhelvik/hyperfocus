import ModalFooter from "src/libs/ui/ModalFooter";
import Board from "src/libs/store/Board";
import Button from "src/libs/ui/Button";
import Deck from "src/libs/store/Deck";
import styled from "styled-components";
import Input from "src/libs/ui/Input";
import { useState } from "react";
import api from "src/libs/api";

type Props = {
  board: Board;
  index?: number;
  resolve: () => void;
};

function AddDeck(props: Props) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const setTitleFromEvent = (event: { target: { value: string } }) => {
    setTitle(event.target.value);
  };

  const onSubmit = async (event: { preventDefault: () => void }) => {
    if (loading) return;
    setLoading(true);
    event.preventDefault();
    const { deckId } = await api.addDeck({
      boardId: props.board.boardId!,
      title: title,
      index: props.index!,
    });
    const deck = new Deck({
      deckId,
      boardId: props.board.boardId!,
      portals: [],
      title: title,
    });
    deck.initialFocus = true;
    props.board.addDeck(deck, props.index!);
    props.resolve();
  };

    return (
      <Container onSubmit={onSubmit}>
        <Title>Create a deck</Title>
        <Input
          autoFocus
          placeholder="Title"
          onChange={setTitleFromEvent}
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

export default AddDeck;

const Container = styled.form`
  min-width: 500px;
`;

const Title = styled.h2`
  margin: 0;
  margin-bottom: 30px;
  color: #333;
  font-size: 1.5rem;
  font-weight: normal;
`;
