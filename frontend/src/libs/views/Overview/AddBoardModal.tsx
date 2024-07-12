import { ChangeEvent, FormEvent, useContext, useState } from "react";
import ModalFooter from "src/libs/ui/ModalFooter";
import Button from "src/libs/ui/Button";
import styled from "styled-components";
import Input from "src/libs/ui/Input";
import Modal from "src/libs/ui/Modal";
import api from "src/libs/api";
import { OverviewStoreContext } from "./OverviewStoreContext";

type Props = {
  close(): void;
};

function AddBoardModal(props: Props) {
  const { onBoardAdded } = useContext(OverviewStoreContext);
  const [title, setTitle] = useState("");

  const setTitleFromEvent = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTitle("");
    api.createBoard({
      title,
    }).then(board => {
      onBoardAdded(board);
    });
    props.close();
  }

  return (
    <form onSubmit={onSubmit}>
      <Modal hide={props.close}>
        <Title>Name your board</Title>
        <Input
          placeholder="Enter a name"
          onChange={setTitleFromEvent}
          value={title}
          size={50}
          autoFocus
        />
        <ModalFooter>
          <Button $gray type="button" onClick={props.close}>
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
