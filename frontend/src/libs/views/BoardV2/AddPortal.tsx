import { useBoard, useEmitBoardChildAdded } from "./context";
import { useAutoEffect, useAutoMemo } from "hooks.macro";
import ModalFooter from "src/libs/ui/ModalFooter";
import styled, { css } from "styled-components";
import onSelect from "src/libs/util/onSelect";
import { FormEvent, useEffect, useState } from "react";
import ellipsify from "src/libs/ellipsify";
import Button from "src/libs/ui/Button";
import * as theme from "src/libs/theme";
import { Board } from "src/libs/types";
import Input from "src/libs/ui/Input";
import api from "src/libs/api";
import Color from "color";

type Props = {
  index: number | null;
  resolve: () => void;
};

export default function AddPortal(props: Props) {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [decksElement, setDecksElement] = useState<HTMLElement | null>(null);
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

  useEffect(() => {
    if (!selectedBoardId) return;
    const timeout = setTimeout(() => {
      decksElement?.querySelector("button")?.focus();
    }, 100);
    return () => {
      clearTimeout(timeout);
    }
  }, [selectedBoardId, decksElement]);

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
      <InputWrapper>
        <Input
          placeholder="Name in this board"
          labelAboveColor="white"
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
              {...onSelect(() => {
                setSelectedBoardId(board.boardId);
              })}
            >
              {ellipsify(board.title || "Untitled")}
            </Tile>
          ))}
        </Section>
        <Section ref={setDecksElement}>
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
        <Button $cancel onClick={() => props.resolve()} type="button">
          Cancel
        </Button>
        <Button disabled={!selectedDeck || !title} type="submit" $white>Create portal</Button>
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
}) <{ $selected?: boolean; $empty?: boolean }>`
  width: 100%;
  border: 1px solid transparent;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  background: white;
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
      background: ${Color(theme.baseColor).mix(Color("white"), 0.3).hex()};
      color: black;
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
  color: white;
  border-bottom: 1px solid #707070;
  margin-bottom: 10px;
`;

const InputWrapper = styled.div`
  padding-bottom: 10px;
  margin-bottom: 10px;
`;
