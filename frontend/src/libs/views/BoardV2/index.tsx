import { useAutoCallback, useAutoMemo } from "hooks.macro";
import { useNavigate, useParams } from "react-router-dom";
import Board, { BoardParam } from "src/libs/store/Board";
import { useState, useEffect } from "react";
import classes from "./styles.module.css";
import useModal from "src/libs/useModal";
import Header from "src/libs/ui/Header";
import * as theme from "src/libs/theme";
import { BoardView } from "./BoardView";
import styled from "styled-components";
import AddCircle from "./AddCircle";
import AddPortal from "./AddPortal";
import AddDeck from "./AddDeck";
import api from "src/libs/api";

export default function BoardV2() {
  const { boardId } = useParams<{ boardId: string }>();
  if (!boardId) throw Error("Expected boardId to be provided");

  const [boardParam, setBoardParam] = useState<BoardParam | null>(null);
  const [div, setDiv] = useState<HTMLDivElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { showModal, renderModal } = useModal();
  const navigate = useNavigate();

  const refresh = useAutoCallback(() => setRefreshKey(refreshKey => refreshKey + 1));

  const board = useAutoMemo(() => {
    if (!boardParam) return null;
    return new Board(boardParam)
  });

  const addDeck = async () => {
    if (!board) return;
    await showModal((props) => <AddDeck {...props} board={board} />);
    dispatchEvent(new Event("subtask:addDeck"));
    refresh();
  };

  const addPortal = async () => {
    if (!board) return;
    await showModal((props) => <AddPortal {...props} board={board} />, {
      width: 700,
    });
    refresh();
  };

  useEffect(() => {
    let cancelled = false;
    api.getBoard({ boardId }).then((board) => {
      if (cancelled) return;
      setBoardParam(board);
    });
    return () => {
      cancelled = true;
    };
  }, [boardId, refreshKey]);

  useEffect(() => {
    if (!boardParam) return;
    if (!div) return;
    const boardView = new BoardView(div, boardParam);
    return () => boardView.unmount();
  }, [div, boardParam]);

  return (
    <div className={classes.boardView}>
      <Header>
        <Breadcrumbs>
          <CrumbButton onClick={() => navigate("/app")}>
            My boards
          </CrumbButton>
          <div>›</div>
          <Title>{boardParam?.title}</Title>
        </Breadcrumbs>
      </Header>
      <div ref={setDiv} />
      <AddCircle>
        <AddItem onClick={addDeck}>
          <AddItemText>Add Deck</AddItemText>
        </AddItem>
        <AddItem onClick={addPortal}>
          <AddItemText>Add portal</AddItemText>
        </AddItem>
      </AddCircle>
      {renderModal()}
    </div>
  );
}

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
`;

const AddItem = styled.div`
  background: ${theme.ui1};
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: ${theme.ui2};
  }
  padding: 10px;
  height: 55px;
  display: flex;
  align-items: flex-start;

  &:first-child {
    border-top-left-radius: 4px;
  }
`;

const AddItemText = styled.div`
  margin: auto;
  color: white;
`;
