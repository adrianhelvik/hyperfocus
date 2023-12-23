import { styled } from "solid-styled-components";
import { For, createEffect } from "solid-js";
import BoardTile from "./BoardTile";
import * as theme from "theme";
import * as store from "store";
import auth from "auth";
import api from "api";

export default function BoardList() {
    createEffect(() => {
        auth.authenticate();
    });

    createEffect(() => {
        if (auth.status === "failure") window.location.href = "/login";
    });

    createEffect(() => {
        if (auth.status !== "success") return;
        api.ownBoards().then(({ boards }: any) => {
            store.setBoards(boards);
        });
    });

    return (
        <Container>
            <Header>
                <Title>My boards</Title>
                <PlusButton onClick={() => store.setIsAddingBoard(true)}>
                    <span class="material-symbols-outlined">add</span>
                </PlusButton>
            </Header>
            <Boards>
                <For each={store.boards()}>
                    {(board) => <BoardTile board={board} />}
                </For>
                {!store.boards().length && <div>You have no boards yet</div>}
            </Boards>
        </Container>
    );
}

const Container = styled.div`
    max-width: 960px;
    margin: 0 auto;
    margin-top: 40px;
`;

const Boards = styled.div`
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
    transition:
        background-color 0.3s,
        box-shadow 0.3s;
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
