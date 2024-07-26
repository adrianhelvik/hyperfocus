import withConfirm, { WithConfirmProps } from "src/libs/withConfirm";
import { BoardViewContext, BoardViewContextType } from "./context";
import withModal, { WithModalProps } from "src/libs/withModal";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { useAutoCallback, useAutoMemo } from "hooks.macro";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useOnKeyDown from "src/util/useOnKeyDown";
import { Board, Deck } from "src/libs/types";
import { GlobalStyle } from "./components";
import classes from "./styles.module.css";
import Header from "src/libs/ui/Header";
import { BoardView } from "./BoardView";
import styled from "styled-components";
import AddCircle from "./AddCircle";
import api from "src/libs/api";
import useAssertStable from "src/util/useAssertStable";

type Props = WithMenuProps & WithConfirmProps & WithModalProps;

export default withModal(withConfirm(withMenu(function BoardV2(props: Props) {
  const { boardId } = useParams<{ boardId: string, deckId?: string }>();
  if (!boardId) throw Error("Expected boardId to be provided");

  const [boardView, setBoardView] = useState<BoardView | null>(null);
  const [div, setDiv] = useState<HTMLDivElement | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!boardId) return;

    SOCKET_IO.emit("joinBoard", boardId);

    return () => {
      SOCKET_IO.emit("leaveBoard", boardId)
    };
  }, [boardId])

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

  useAssertStable(navigate, "navigate");
  useAssertStable(props.showMenu, "props.showMenu");
  useAssertStable(props.confirmInPlace, "props.confirmInPlace");
  useAssertStable(props.showModalInPlace, "props.showModalInPlace");

  useEffect(() => {
    if (!hasBoard) return;
    if (!div) return;
    const boardView = new BoardView(
      div,
      boardRef.current!,
      props.showMenu,
      props.confirmInPlace,
      props.showModalInPlace,
    );
    setBoardView(boardView);
    return () => {
      return boardView.unmount();
    };
  }, [
    div,
    hasBoard,
    boardId,
    // Stable values
    navigate,
    props.showMenu,
    props.confirmInPlace,
    props.showModalInPlace,
  ]);

  useOnKeyDown((e) => {
    if ((e.metaKey || e.ctrlKey) && /[1-9]/.test(e.key)) {
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
      <GlobalStyle />
      <div className={classes.boardView}>
        <Header>
          <Breadcrumbs>
            <NotOnSmallScreens>
              <CrumbButton onClick={() => navigate("/app")}>
                My boards
              </CrumbButton>
              <div>›</div>
            </NotOnSmallScreens>
            <Title>{board?.title}</Title>
          </Breadcrumbs>
        </Header>
        <div ref={setDiv} />
        <AddCircle />
      </div>
    </BoardViewContext.Provider>
  );
})));

const NotOnSmallScreens = styled.div`
  display: contents;

  @media (max-width: 800px) {
    display: none;
  }
`;

const Breadcrumbs = styled.header`
  display: flex;
  align-items: start;
  gap: 10px;
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

  @media (max-width: 800px) {
  }
`;
