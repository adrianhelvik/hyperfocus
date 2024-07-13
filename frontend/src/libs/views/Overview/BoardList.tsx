import addGridKeyboardNavigation from "src/util/addGridKeyboardNavigation";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { OverviewStoreContext } from "./OverviewStoreContext";
import { AuthContext } from "src/libs/authContext";
import { useAutoLayoutEffect } from "hooks.macro";
import { useNavigate } from "react-router-dom";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import { Observer } from "mobx-react";
import BoardTile from "./BoardTile";
import Color from "color";

export default function BoardList() {
  const [gridElement, setGridElement] = useState<HTMLDivElement | null>(null);
  const { setIsAddingBoard, isAddingBoard, boards } =
    useContext(OverviewStoreContext);
  const auth = useContext(AuthContext)!;
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (isAddingBoard) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;

      if (e.metaKey && /[1-9]/.test(e.key)) {
        e.preventDefault();
        navigate(`/board/${boards[parseInt(e.key, 10) - 1].boardId}`);
      }

      if (!e.ctrlKey && !e.metaKey && e.key === "+") {
        e.preventDefault();
        setIsAddingBoard(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  useAutoLayoutEffect(() => {
    if (gridElement) {
      return addGridKeyboardNavigation(gridElement);
    }
  });

  useEffect(() => {
    if (auth.status === "failure") {
      return navigate("/login");
    }
  }, [auth.status]);

  const modifierKey = navigator.userAgent.includes(" Mac ") ? "⌘" : "ctrl ";

  return (
    <Observer>
      {() => {
        return (
          <Container>
            <Header>
              <Title>My boards</Title>
              <PlusButton onClick={() => setIsAddingBoard(true)}>
                New board
                <span className="material-symbols-outlined">add</span>
              </PlusButton>
            </Header>
            <Grid ref={setGridElement}>
              {boards.map((board, i) => (
                <BoardTile
                  key={board.boardId}
                  board={board}
                  shortcut={
                    !("ontouchstart" in document) && i <= 8
                      ? `${modifierKey}${i + 1}`
                      : null
                  }
                />
              ))}
              {!boards.length && <div>You have no boards yet</div>}
            </Grid>
          </Container>
        );
      }}
    </Observer>
  );
}

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  margin-top: 25px;
`;

const Grid = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
`;

const PlusButton = styled.button`
  background-color: ${Color(theme.baseColor).alpha(0.2).string()};
  border: 0;
  color: white;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s, box-shadow 0.3s;
  font-size: inherit;
  cursor: pointer;
  padding: 5px;
  padding-left: 10px;
  gap: 10px;
  padding-left: 16px;

  &:hover {
    background-color: ${Color(theme.baseColor).alpha(0.3).string()};
    box-shadow: ${theme.shadows[1]};
  }

  &:hover:active {
    background-color: ${Color(theme.baseColor).alpha(0.4).string()};
  }

  & .material-symbols-outlined {
    border: 1px solid white;
    border-radius: 5px;
    color: white !important;
  }

  @media (hover: none) {
    gap: 5px;
    padding-right: 7px;
    & .material-symbols-outlined {
      border: none;
      background-color: transparent;
    }
  }
`;

const Title = styled.h2`
  margin: 0;
  font-weight: 400;
  font-size: 20px;
  color: white;
  letter-spacing: 0.1rem;
`;
