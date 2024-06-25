import ModalFooter from "src/libs/ui/ModalFooter";
import { observable, action } from "mobx";
import Board from "src/libs/store/Board";
import Button from "src/libs/ui/Button";
import Deck from "src/libs/store/Deck";
import styled from "styled-components";
import { observer } from "mobx-react";
import Input from "src/libs/ui/Input";
import api from "src/libs/api";
import React from "react";

type Props = {
  board: Board;
  index?: number;
  resolve: () => void;
};

@observer
class AddDeck extends React.Component<Props> {
  @observable loading = false;
  @observable title = "";

  @action.bound setTitle(event: { target: { value: string } }) {
    this.title = event.target.value;
  }

  onSubmit = async (event: { preventDefault: () => void }) => {
    if (this.loading) return;
    this.loading = true;
    event.preventDefault();
    const { deckId } = await api.addDeck({
      boardId: this.props.board.boardId,
      title: this.title,
      index: this.props.index,
    });
    const deck = new Deck({
      deckId,
      boardId: this.props.board.boardId,
      portals: [],
      title: this.title,
    });
    deck.initialFocus = true;
    this.props.board.addDeck(deck, this.props.index);
    this.props.resolve();
  };

  render() {
    return (
      <Container onSubmit={this.onSubmit}>
        <Title>Create a deck</Title>
        <Input
          autoFocus
          placeholder="Title"
          onChange={this.setTitle}
          value={this.title}
        />
        <ModalFooter>
          <Button $gray type="button" onClick={() => this.props.resolve()}>
            Cancel
          </Button>
          <Button>Create</Button>
        </ModalFooter>
      </Container>
    );
  }
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
