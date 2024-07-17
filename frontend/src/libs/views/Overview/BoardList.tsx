import addGridKeyboardNavigation from "src/util/addGridKeyboardNavigation";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { OverviewStoreContext } from "./OverviewStoreContext";
import styled, { keyframes } from "styled-components";
import { AuthContext } from "src/libs/authContext";
import { useAutoLayoutEffect } from "hooks.macro";
import { useNavigate } from "react-router-dom";
import * as theme from "src/libs/theme";
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

      if ((e.metaKey || e.ctrlKey) && /[1-9]/.test(e.key)) {
        e.preventDefault();
        if (boards !== null) {
          navigate(`/board/${boards[parseInt(e.key, 10) - 1].boardId}`);
        }
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
    <Container>
      <Header>
        <Title>My boards</Title>
        <PlusButton onClick={() => setIsAddingBoard(true)}>
          New board
          <span className="material-symbols-outlined">add</span>
        </PlusButton>
      </Header>
      <Grid ref={setGridElement}>
        {boards !== null && boards.map((board, i) => (
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
        {boards !== null && !boards.length && <NoBoardsYet>
          You have no boards yet.
          <br />
          Click + to get started.
          <br />
          <small>
            You can use the keyboard as well.
          </small>
        </NoBoardsYet>}
        {boards === null && <Loading>
          <LoadingCard $top={0} $left={0} />
          <LoadingCard $top={0} $left={1} />
          <LoadingCard $top={1} $left={0} />
          <LoadingCard $top={1} $left={1} />
        </Loading>}
      </Grid>
    </Container>
  );
}

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  margin-top: 25px;
`;

const Grid = styled.div`
  transform: translate3d(0, 0, 0);
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
    background-color: ${Color(theme.baseColor).alpha(0.4).string()};
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

const NoBoardsYet = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  position: fixed;
  inset: 0;
  top: 30vh;
  font-size: 60px;
  color: ${Color(theme.baseColor).mix(Color("white"), 0.5).mix(Color("black"), 0.3).string()};

  & small {
    font-size: 30px;
    margin-top: 50px;
  }

  @media (touch: none) {
    & small {
      display: none;
    }
  }
`;

const Loading = styled.div`
  --border-radius: 10px;
  --width: 80px;
  --height: 60px;
  --gap: 10px;

  --full-width: calc(var(--width) * 2 + var(--gap));
  --full-height: calc(var(--height) * 2 + var(--gap));

  gap: 15px;
  margin: 0 auto;
  position: fixed;
  top: 150px;
  justify-content: center;
  margin-left: calc(50% - var(--full-width) / 2);

  width: var(--full-width);
  height: var(--full-height);
`;

const transform = (x: number, y: number) => {
  return `translateX(calc((${x}) * (var(--width) + var(--gap)))) translateY(calc((${y}) * (var(--height) + var(--gap))))`;
};

const kf00 = keyframes`
  0% {
    transform: ${transform(0, 0)};
  }
  25% {
    transform: ${transform(1, 0)};
  }
  50% {
    transform: ${transform(1, 1)};
  }
  75% {
    transform: ${transform(0, 1)};
  }
  100% {
    transform: ${transform(0, 0)};
  }
`;

const kf10 = keyframes`
  0% {
    transform: ${transform(1, 0)};
  }
  25% {
    transform: ${transform(1, 1)};
  }
  50% {
    transform: ${transform(0, 1)};
  }
  75% {
    transform: ${transform(0, 0)};
  }
  100% {
    transform: ${transform(1, 0)};
  }
`;

const kf11 = keyframes`
  0% {
    transform: ${transform(1, 1)};
  }
  25% {
    transform: ${transform(0, 1)};
  }
  50% {
    transform: ${transform(0, 0)};
  }
  75% {
    transform: ${transform(1, 0)};
  }
  100% {
    transform: ${transform(1, 1)};
  }
`;

const kf01 = keyframes`
  0% {
    transform: ${transform(0, 1)};
  }
  25% {
    transform: ${transform(0, 0)};
  }
  50% {
    transform: ${transform(1, 0)};
  }
  75% {
    transform: ${transform(1, 1)};
  }
  100% {
    transform: ${transform(0, 1)};
  }
`;

const LoadingCard = styled.div<{ $top: number, $left: number }>`
  --top: ${p => p.$top};
  --left: ${p => p.$left};

  background-color: ${Color(theme.baseColor).mix(Color("white"), 0.5).alpha(0.2).string()};
  border-radius: var(--border-radius);
  width: var(--width);
  height: var(--height);
  position: absolute;
  top: 0;
  left: 0;
  transform: ${p => transform(p.$left, p.$top)};

  animation: ${(p) => {
    if (p.$left === 0 && p.$top === 0) {
      return kf00;
    }
    if (p.$left === 1 && p.$top === 0) {
      return kf10;
    }
    if (p.$left === 1 && p.$top === 1) {
      return kf11;
    }
    if (p.$left === 0 && p.$top === 1) {
      return kf01;
    }
  }} forwards 3000ms infinite;
`;
