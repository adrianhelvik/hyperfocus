import PortalModel, { PortalParam } from "src/libs/store/Portal";
import DeckModel, { DeckParam } from "src/libs/store/Deck";
import Store, { StoreContext } from "src/libs/store";
import ModalFooter from "src/libs/ui/ModalFooter";
import styled, { css } from "styled-components";
import BoardModel from "src/libs/store/Board";
import onSelect from "src/libs/util/onSelect";
import BoardType from "src/libs/store/Board";
import ellipsify from "src/libs/ellipsify";
import { observable, action } from "mobx";
import Board from "src/libs/store/Board";
import React, { FormEvent } from "react";
import Button from "src/libs/ui/Button";
import * as theme from "src/libs/theme";
import Deck from "src/libs/store/Deck";
import { observer } from "mobx-react";
import Input from "src/libs/ui/Input";
import Help from "src/libs/ui/Help";
import api from "src/libs/api";

type Props = {
  board: BoardType;
  index?: number;
  resolve?: () => void;
};

@observer
class AddPortal extends React.Component<Props> {
  static contextType = StoreContext;
  declare context: Store;

  @observable board: Board | null = null;
  @observable deck: Deck | null = null;
  @observable title = "";

  async componentDidMount() {
    const { boards } = await api.ownBoards();
    this.context.setBoards(
      boards.map(({ children, ...board }) => {
        return new BoardModel({
          children: children.map((child) => {
            if (child.type === "deck") return new DeckModel(child as DeckParam);
            if (child.type === "portal")
              return new PortalModel(child as PortalParam);
            throw Error(`Invalid child type: ${child.type}`);
          }),
          ...board,
        });
      })
    );
  }

  @action setBoard(board: BoardType) {
    this.board = board;
    this.deck = null;
  }

  @action setDeck(deck: Deck) {
    this.deck = deck;
  }

  @action setTitle(title: string) {
    this.title = title;
  }

  onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!this.board || !this.deck || !this.title) return;
    const { portalId } = await api.addPortal({
      boardId: this.props.board.boardId!,
      deckId: this.deck.deckId,
      index: this.props.index!,
      title: this.title,
    });
    this.props.board.addPortal({
      boardId: this.props.board.boardId!,
      deckId: this.deck.deckId,
      index: this.props.index,
      target: this.deck,
      title: this.title,
      portalId,
    });
    this.props.resolve?.();
  };

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <MainTitle>
          Create portal{" "}
          <Help>
            A portal is a link to a deck from another board. With portals it
            becomes easier to move cards from one board to another.
          </Help>
        </MainTitle>
        <InputWrapper>
          <Input
            placeholder="Name in this board"
            autoFocus
            value={this.title}
            onChange={(e) => this.setTitle(e.target.value)}
          />
        </InputWrapper>
        <Sections>
          <Section>
            <Title>Select board</Title>
            {this.context.boards.map((board) => (
              <Tile
                key={board.boardId}
                $selected={this.board === board}
                $empty={board.decks.length === 0}
                {...onSelect(() => this.setBoard(board))}
              >
                {ellipsify(board.title || "Untitled")}
              </Tile>
            ))}
          </Section>
          <Section>
            <Title>Select Deck</Title>
            {this.board &&
              this.board.decks.map((deck) => (
                <Tile
                  key={deck.deckId}
                  $selected={this.deck === deck}
                  {...onSelect(() => this.setDeck(deck))}
                >
                  {ellipsify(deck.title || "Untitled")}
                </Tile>
              ))}
          </Section>
        </Sections>
        <hr />
        <ModalFooter>
          <Button $gray onClick={() => this.props.resolve?.()}>
            Cancel
          </Button>
          <Button disabled={!this.board || !this.deck || !this.title}>
            Create portal
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default AddPortal;

const Sections = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const Tile = styled.button.attrs({
  type: "button",
})<{ $selected?: boolean; $empty?: boolean }>`
  width: 100%;
  border: 1px solid transparent;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  background: #ddd;
  ${(p) =>
    p.$selected &&
    css`
      background: ${theme.ui1};
      color: white;
    `};

  ${(p) =>
    p.$empty &&
    css`
      opacity: 0.5;
    `}

  &:not(:last-child) {
    margin-bottom: 10px;
  }
  &:focus {
    outline: none;
    border-color: #707070;
  }
  &:active:hover {
    background: #707070;
    color: white;
  }
`;

const Section = styled.section`
  min-width: 200px;
  min-height: 400px;
  max-height: calc(100vh - 400px);
  overflow: auto;

  &:not(:last-child) {
    margin-right: 10px;
  }
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
