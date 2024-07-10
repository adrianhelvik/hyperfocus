import { ChangeEvent, FormEvent, useContext, useState } from "react";
import ModalFooter from "src/libs/ui/ModalFooter";
import { StoreContext } from "src/libs/store";
import Board from "src/libs/store/Board";
import Button from "src/libs/ui/Button";
import styled from "styled-components";
import Input from "src/libs/ui/Input";
import Modal from "src/libs/ui/Modal";

function AddBoardModal() {
  const store = useContext(StoreContext)!;
  const [title, setTitle] = useState("");

  const setTitleFromEvent = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    store.addBoard(new Board(title));
    setTitle("");
    store.stopAddingBoard();
  }

  return (
    <form onSubmit={onSubmit}>
      <Modal hide={store.stopAddingBoard}>
        <Title>Name your board</Title>
        <Input
          placeholder="Enter a name"
          onChange={setTitleFromEvent}
          value={title}
          size={50}
          autoFocus
        />
        <ModalFooter>
          <Button $gray type="button" onClick={store.stopAddingBoard}>
            Cancel
          </Button>
          <Button>Create</Button>
        </ModalFooter>
      </Modal>
    </form>
  );
}

export default AddBoardModal;

const Title = styled.h2`
  font-weight: normal;
  margin: 0;
  margin-bottom: 20px;
  color: #333;
`;
