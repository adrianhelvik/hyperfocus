import { useNavigate, useParams } from "react-router-dom";
import { useAutoCallback } from "hooks.macro";
import { useState, useEffect } from "react";
import classes from "./styles.module.css";
import useModal from "src/libs/useModal";
import Header from "src/libs/ui/Header";
import * as theme from "src/libs/theme";
import { BoardView } from "./BoardView";
import { Board } from "src/libs/types";
import styled from "styled-components";
import AddCircle from "./AddCircle";
import AddPortal from "./AddPortal";
import AddDeck from "./AddDeck";
import api from "src/libs/api";

export default function BoardV2() {
  const { boardId } = useParams<{ boardId: string }>();
  if (!boardId) throw Error("Expected boardId to be provided");

  const [board, setBoard] = useState<Board | null>(null);
  const [div, setDiv] = useState<HTMLDivElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { showModal, renderModal } = useModal();
  const navigate = useNavigate();

  const refresh = useAutoCallback(() => setRefreshKey(refreshKey => refreshKey + 1));

  const addDeck = async () => {
    if (!board) return;
    await showModal((props) => <AddDeck {...props} board={board} />);
    dispatchEvent(new Event("subtask:addDeck"));
    refresh();
  };

  const addPortal = async () => {
    if (!board) return;
    await showModal((props) => <AddPortal {...props} board={board} index={null} />, {
      width: 700,
    });
    refresh();
  };

  useEffect(() => {
    let cancelled = false;
    api.getBoard({ boardId }).then((board) => {
      if (cancelled) return;
      setBoard(board);
    });
    return () => {
      cancelled = true;
    };
  }, [boardId, refreshKey]);

  useEffect(() => {
    if (!board) return;
    if (!div) return;
    const boardView = new BoardView(div, board);
    return () => boardView.unmount();
  }, [div, board, navigate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && /[1-9]/.test(e.key)) {
        e.preventDefault();
        return navigate("/app");
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
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
