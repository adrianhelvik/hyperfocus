import { useBoard, useEmitBoardChildAdded } from "./context";
import { useAutoEffect, useAutoMemo } from "hooks.macro";
import ModalFooter from "src/libs/ui/ModalFooter";
import styled, { css } from "styled-components";
import onSelect from "src/libs/util/onSelect";
import { FormEvent, useState } from "react";
import ellipsify from "src/libs/ellipsify";
import Button from "src/libs/ui/Button";
import * as theme from "src/libs/theme";
import { Board } from "src/libs/types";
import Input from "src/libs/ui/Input";
import Help from "src/libs/ui/Help";
import api from "src/libs/api";

type Props = {
  index: number | null;
  resolve: () => void;
};

export default function AddPortal(props: Props) {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState("");
  const board = useBoard();

  const emitDeckAdded = useEmitBoardChildAdded();

  const selectedBoard = useAutoMemo(() => {
    if (!selectedBoardId) return null;
    if (!boards) return null;
    return boards.find((it) => it.boardId === selectedBoardId);
  });

  const selectedDeck = useAutoMemo(() => {
    if (!selectedDeckId) return null;
    if (!selectedBoard) return null;
    for (const child of selectedBoard.children) {
      if (child.type === "deck" && child.deckId === selectedDeckId) {
        return child;
      }
    }
    return null;
  });

  useAutoEffect(() => {
    let cancelled = false;
    api.ownBoards().then((response) => {
      if (cancelled) return;
      setBoards(response.boards);
    });
    return () => {
      cancelled = true;
    };
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedDeck || !title || !board) return;
    const portal = await api.addPortal({
      boardId: board.boardId,
      deckId: selectedDeck.deckId,
      index: props.index,
      title: title,
    });
    props.resolve();
    emitDeckAdded(portal);
  };

  return (
    <form onSubmit={onSubmit}>
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </InputWrapper>
      <Sections>
        <Section>
          <Title>Select board</Title>
          {boards.map((board) => (
            <Tile
              key={board.boardId}
              $selected={board.boardId === selectedBoardId}
              $empty={board.children.length === 0}
              {...onSelect(() => setSelectedBoardId(board.boardId))}
            >
              {ellipsify(board.title || "Untitled")}
            </Tile>
          ))}
        </Section>
        <Section>
          <Title>Select Deck</Title>
          {selectedBoard &&
            selectedBoard.children
              .filter((it) => it.type === "deck")
              .map((deck) => (
                <Tile
                  key={deck.deckId}
                  $selected={deck.deckId === selectedDeckId}
                  {...onSelect(() => setSelectedDeckId(deck.deckId))}
                >
                  {ellipsify(deck.title || "Untitled")}
                </Tile>
              ))}
        </Section>
      </Sections>
      <hr />
      <ModalFooter>
        <Button $gray onClick={() => props.resolve()}>
          Cancel
        </Button>
        <Button disabled={!selectedDeck || !title}>Create portal</Button>
      </ModalFooter>
    </form>
  );
}

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

  ${(p) =>
    p.$selected &&
    css`
      background: ${theme.radiantPurple};
      color: white;
    `};

  ${(p) =>
    p.$empty &&
    css`
      opacity: 0.5;
    `}
`;

const Section = styled.section`
  &:not(:last-child) {
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
