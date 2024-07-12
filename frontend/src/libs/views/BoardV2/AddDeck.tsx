import ModalFooter from "src/libs/ui/ModalFooter";
import Button from "src/libs/ui/Button";
import styled from "styled-components";
import Input from "src/libs/ui/Input";
import { useState } from "react";
import api from "src/libs/api";
import { Board } from "src/libs/types";

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
    await api.addDeck({
      boardId: props.board.boardId,
      title: title,
      index: props.index!,
    });
    // TODO: Add new deck to board instead of reloading in the parent component.
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
`;

const Title = styled.h2`
  margin: 0;
  margin-bottom: 30px;
  color: #333;
  font-size: 1.5rem;
  font-weight: normal;
`;
