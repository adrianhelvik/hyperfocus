import { withAuth, Auth } from "authContext";
import Store, { StoreContext } from "store";
import { Redirect } from "react-router-dom";
import styled from "styled-components";
import { observer } from "mobx-react";
import BoardTile from "./BoardTile";
import Board from "store/Board";
import * as theme from "theme";
import React from "react";
import api from "api";

const RedirectAny = Redirect as any;

class BoardList extends React.Component<{ auth: Auth }> {
    static contextType = StoreContext;
    declare context: Store;

    async componentDidMount() {
        if (!(await this.props.auth.authenticate())) return;

        const { boards } = await api.ownBoards();

        this.context.setBoards(boards.map((b) => new Board(b)));
    }

    render() {
        if (this.props.auth.status === "failure")
            return <RedirectAny to="/login" />;
        return (
            <Container>
                <Header>
                    <Title>My boards</Title>
                    <PlusButton onClick={this.context.startAddingBoard}>
                        <span className="material-symbols-outlined">add</span>
                    </PlusButton>
                </Header>
                <Boards>
                    {this.context.boards.map((board) => (
                        <BoardTile key={board.boardId} board={board} />
                    ))}
                    {!this.context.boards.length && (
                        <div>You have no boards yet</div>
                    )}
                </Boards>
            </Container>
        );
    }
}

export default withAuth(observer(BoardList));

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
