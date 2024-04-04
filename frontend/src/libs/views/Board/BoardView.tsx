import {
    Redirect as RedirectOriginal,
    useHistory,
    useParams,
} from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "src/libs/store";
import Loading from "src/libs/ui/Loading";
import * as theme from "src/libs/theme";
import Header from "src/libs/ui/Header";
import styled from "styled-components";
import { observer } from "mobx-react";
import DecksList from "./DecksList";
import AddPortal from "./AddPortal";
import AddCircle from "./AddCircle";
import loadBoard from "./loadBoard";
import AddDeck from "./AddDeck";
import useModal from "src/libs/useModal";

// TODO: Fix typings
const Redirect = RedirectOriginal as any;

export default observer(function BoardView() {
    const [loading, setLoading] = useState<boolean>(true);
    const { boardId } = useParams<{ boardId: string }>();
    const { showModal, renderModal } = useModal();
    const store = useContext(StoreContext);
    const history = useHistory();

    const addDeck = async () => {
        await showModal((props) => <AddDeck {...props} board={store.board} />);
    };

    const addPortal = async () => {
        await showModal(
            (props) => <AddPortal {...props} board={store.board} />,
            { width: 700 }
        );
    };

    useEffect(() => {
        loadBoard({ store, boardId, history, setLoading });
    }, [store, boardId]);

    if (loading) {
        return <Loading />;
    }

    if (!store.board) {
        return <Redirect to="/" />;
    }

    return (
        <>
            <Container>
                <Header color={store.board.color}>
                    <Breadcrumbs>
                        <GoBack onClick={() => history.goBack()}>
                            My boards
                        </GoBack>
                        <div>›</div>
                        <Title>{store.board.title}</Title>
                    </Breadcrumbs>
                </Header>
                <DecksList />
                <AddCircle>
                    <AddItem onClick={addDeck}>
                        <AddItemText>Add Deck</AddItemText>
                    </AddItem>
                    <AddItem onClick={addPortal}>
                        <AddItemText>Add portal</AddItemText>
                    </AddItem>
                </AddCircle>
            </Container>
            {renderModal()}
        </>
    );
});

const Container = styled.main`
    background: ${theme.bg1};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
`;

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
