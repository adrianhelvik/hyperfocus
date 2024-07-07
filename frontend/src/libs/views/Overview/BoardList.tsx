import { AuthContext } from "src/libs/authContext";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "src/libs/store";
import React, { useEffect } from "react";
import Board from "src/libs/store/Board";
import * as theme from "src/libs/theme";
import ProjectTile from "./ProjectTile";
import styled from "styled-components";
import { Observer } from "mobx-react";
import BoardTile from "./BoardTile";
import api from "src/libs/api";

export default function BoardList() {
  const store = React.useContext(StoreContext)!;
  const auth = React.useContext(AuthContext)!;
  const navigate = useNavigate();

  React.useEffect(() => {
    api.ownBoards().then(({ boards }) => {
      store.setBoards(boards.map((b) => new Board(b)));
    });
  }, [store]);

  React.useEffect(() => {
    api.ownProjects().then(({ projects }) => {
      store.setProjects(projects);
    });
  }, [store]);

  React.useLayoutEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && /[1-9]/.test(e.key)) {
        e.preventDefault();
        navigate(`/board/${store.boards[parseInt(e.key, 10) - 1].boardId}`);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  useEffect(() => {
    if (auth.status === "failure") {
      return navigate("/login")
    }
  }, [auth.status]);

  if (!store) return null;

  return (
    <Observer>
      {() => {
        return (
          <Container>
            <Header>
              <Title>Projects</Title>
              <PlusButton onClick={store.startAddingProject}>
                <span className="material-symbols-outlined">add</span>
              </PlusButton>
            </Header>
            <Grid>
              <ProjectTile
                project={{ title: "Personal project" }}
                isSelected={true}
              />
            </Grid>
            <Header>
              <Title>My boards</Title>
              <PlusButton onClick={store.startAddingBoard}>
                <span className="material-symbols-outlined">add</span>
              </PlusButton>
            </Header>
            <Grid>
              {store.boards.map((board) => (
                <BoardTile key={board.boardId} board={board} />
              ))}
              {!store.boards.length && <div>You have no boards yet</div>}
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
  margin-top: 40px;
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
  margin-left: 20px;
  margin-bottom: 0;
  margin-top: 20px;
  gap: 10px;
`;

const PlusButton = styled.button`
  background-color: ${theme.ui1};
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s, box-shadow 0.3s;
  box-shadow: ${theme.shadows[0]};
  cursor: pointer;

  &:hover {
    background-color: ${theme.ui2};
    box-shadow: ${theme.shadows[1]};
  }

  &:hover:active {
    background-color: ${theme.darkPurple};
  }
`;

const Title = styled.h2`
  margin: 0;
  font-weight: 400;
  font-size: 25px;
  color: ${theme.ui1};
  letter-spacing: 0.1rem;
`;
