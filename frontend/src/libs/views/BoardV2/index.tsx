import { BoardViewContext, BoardViewContextType } from "./context";
import { useAutoCallback, useAutoMemo } from "hooks.macro";
import { useNavigate, useParams } from "react-router-dom";
import useOnKeyDown from "src/util/useOnKeyDown";
import { Board, Deck } from "src/libs/types";
import { useState, useEffect, useRef } from "react";
import classes from "./styles.module.css";
import Header from "src/libs/ui/Header";
import { BoardView } from "./BoardView";
import styled from "styled-components";
import AddCircle from "./AddCircle";
import api from "src/libs/api";

export default function BoardV2() {
  const { boardId } = useParams<{ boardId: string, deckId?: string }>();
  if (!boardId) throw Error("Expected boardId to be provided");
  const [boardView, setBoardView] = useState<BoardView | null>(null);
  const [div, setDiv] = useState<HTMLDivElement | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api.getBoard({ boardId }).then((board) => {
      if (cancelled) return;
      setBoard(board);
    });
    return () => {
      cancelled = true;
    };
  }, [boardId]);

  // We don't want to remount the BoardView whenever
  // the board updates. The BoardView is responsible
  // for maintaining its own internal structures.

  const hasBoard = board != null;
  const boardRef = useRef<Board | null>(board);
  boardRef.current = board;

  useEffect(() => {
    if (!hasBoard) return;
    if (!div) return;
    const boardView = new BoardView(div, boardRef.current!);
    setBoardView(boardView);
    return () => {
      return boardView.unmount();
    };
  }, [div, hasBoard, navigate, boardId]);

  useOnKeyDown((e) => {
    if (e.metaKey && /[1-9]/.test(e.key)) {
      e.preventDefault();
      return navigate("/app");
    }
  });

  const emitDeckAdded = useAutoCallback((deck: Deck) => {
    if (!deck) throw Error("Called emitDeckAdded without a deck");
    if (!boardView) return;

    setBoard((board) => {
      if (!board) return null;
      return {
        ...board,
        children: [...board.children, deck],
      };
    });

    boardView.onDeckAdded(deck);
  });

  const contextValue = useAutoMemo<BoardViewContextType>({
    emitBoardChildAdded: emitDeckAdded,
    board,
  });

  return (
    <BoardViewContext.Provider value={contextValue}>
      <div className={classes.boardView}>
        <Header>
          <Breadcrumbs>
            <CrumbButton onClick={() => navigate("/app")}>
              My boards
            </CrumbButton>
            <div>›</div>
            <Title>{board?.title}</Title>
          </Breadcrumbs>
        </Header>
        <div ref={setDiv} />
        <AddCircle />
      </div>
    </BoardViewContext.Provider>
  );
}

const Breadcrumbs = styled.header`
  display: flex;
  align-items: start;
  gap: 10px;

  @media (max-width: 960px) {
    display: none;
  }
`;

const CrumbButton = styled.button`
  background: transparent;
  font-size: inherit;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
  color: inherit;
`;

const Title = styled.div`
  display: inline-block;
`;
