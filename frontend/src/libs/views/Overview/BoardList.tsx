import { Redirect } from "react-router-dom";
import { AuthContext } from "src/libs/authContext";
import ProjectTile from "./ProjectTile";
import styled from "styled-components";
import { Observer } from "mobx-react";
import { StoreContext } from "src/libs/store";
import BoardTile from "./BoardTile";
import Board from "src/libs/store/Board";
import * as theme from "src/libs/theme";
import React from "react";
import api from "src/libs/api";

const RedirectAny = Redirect as any;

export default function BoardList() {
    const store = React.useContext(StoreContext);
    const auth = React.useContext(AuthContext);

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

    if (!store) return null;

    return (
        <Observer>
            {() => {
                if (auth.status === "failure") {
                    return <RedirectAny to="/login" />;
                }

                return (
                    <Container>
                        <Header>
                            <Title>Projects</Title>
                            <PlusButton onClick={store.startAddingProject}>
                                <span className="material-symbols-outlined">
                                    add
                                </span>
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
                                <span className="material-symbols-outlined">
                                    add
                                </span>
                            </PlusButton>
                        </Header>
                        <Grid>
                            {store.boards.map((board) => (
                                <BoardTile key={board.boardId} board={board} />
                            ))}
                            {!store.boards.length && (
                                <div>You have no boards yet</div>
                            )}
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

    :hover {
        background-color: ${theme.ui2};
        box-shadow: ${theme.shadows[1]};
    }

    :hover:active {
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
