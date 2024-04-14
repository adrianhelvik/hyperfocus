import { useHistory, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import classes from "./styles.module.css";
import Board from "src/libs/store/Board";
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
    const [div, setDiv] = useState<HTMLDivElement | null>(null);
    const [board, setBoard] = useState<Board | null>(null);
    const { showModal, renderModal } = useModal();
    const history = useHistory();

    const addDeck = async () => {
        await showModal((props) => <AddDeck {...props} board={board} />);
    };

    const addPortal = async () => {
        await showModal(
            (props) => <AddPortal {...props} board={board} />,
            { width: 700 }
        );
    };

    useEffect(() => {
        let cancelled = false;
        api.getBoard({ boardId }).then((board) => {
            if (cancelled) return;
            setBoard(new Board(board));
        });
        return () => {
            cancelled = true;
        };
    }, [boardId]);

    useEffect(() => {
        if (!board) return;
        if (!div) return;
        const boardView = new BoardView(
            div,
            board,
        );
        return () => boardView.unmount();
    }, [div, board]);

    return (
        <div className={classes.boardView}>
            <Header>
                <Breadcrumbs>
                    <CrumbButton onClick={() => history.push("/app")}>My boards</CrumbButton>
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

    :first-child {
        border-top-left-radius: 4px;
    }
`;

const AddItemText = styled.div`
    margin: auto;
    color: white;
`;
