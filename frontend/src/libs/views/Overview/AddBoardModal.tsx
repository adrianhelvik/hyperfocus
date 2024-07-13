import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { OverviewStoreContext } from "./OverviewStoreContext";
import ModalFooter from "src/libs/ui/ModalFooter";
import { useAutoEffect } from "hooks.macro";
import Button from "src/libs/ui/Button";
import styled from "styled-components";
import Input from "src/libs/ui/Input";
import Modal from "src/libs/ui/Modal";
import api from "src/libs/api";

function AddBoardModal() {
  const { onBoardAdded, setIsAddingBoard } = useContext(OverviewStoreContext);
  const [title, setTitle] = useState("");

  useAutoEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAddingBoard(false);
      }
    };

    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.addEventListener("keyup", onKeyUp);
    };
  });

  const setTitleFromEvent = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTitle("");
    api
      .createBoard({
        title,
      })
      .then((board) => {
        onBoardAdded(board);
      });
    setIsAddingBoard(false);
  };

  return (
    <form onSubmit={onSubmit}>
      <Modal hide={() => setIsAddingBoard(false)}>
        <Title>Name your board</Title>
        <Input
          placeholder="Enter a name"
          onChange={setTitleFromEvent}
          value={title}
          size={50}
          autoFocus
        />
        <ModalFooter>
          <Button $gray type="button" onClick={() => setIsAddingBoard(false)}>
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
