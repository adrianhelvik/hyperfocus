import { useHistory, useParams } from "react-router-dom";
import { BoardParam } from "src/libs/store/Board";
import createBoardView from "./createBoardView";
import { useState, useEffect } from "react";
import classes from "./styles.module.css";
import Header from "src/libs/ui/Header";
import styled from "styled-components";
import api from "src/libs/api";

export default function BoardV2() {
    const { boardId } = useParams<{ boardId: string }>();
    const [div, setDiv] = useState<HTMLDivElement | null>(null);
    const [board, setBoard] = useState<BoardParam | null>(null);
    const history = useHistory();

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

    useEffect(() => {
        if (!board) return;
        if (!div) return;
        const unmount = createBoardView({
            root: div,
            board,
        });
        return () => unmount();
    }, [div, board]);

    return (
        <div className={classes.boardView}>
            <Header>
                <Breadcrumbs>
                    <GoBack onClick={() => history.goBack()}>My boards</GoBack>
                    <div>›</div>
                    <Title>{board?.title}</Title>
                </Breadcrumbs>
            </Header>
            <div ref={setDiv} />
        </div>
    );
}

const Breadcrumbs = styled.header`
    display: flex;
    align-items: start;
    gap: 10px;
`;

const GoBack = styled.button`
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
