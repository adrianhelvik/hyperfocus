import { AuthContext, WithAuthProps } from "authContext";
import withMenu, { WithMenuProps } from "withMenu";
import { Redirect } from "react-router-dom";
import AddBoardModal from "./AddBoardModal";
import React, { MouseEvent } from "react";
import styled from "styled-components";
import { Observer, observer } from "mobx-react";
import { StoreContext } from "store";
import BoardList from "./BoardList";
import Header from "ui/Header";

const RedirectAny = Redirect as any;

type Props = WithAuthProps &
    WithMenuProps & {
        children?: React.ReactNode;
    };

export default withMenu(function Overview(props: Props) {
    const store = React.useContext(StoreContext);
    const auth = React.useContext(AuthContext);

    const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();

        props.showMenu(event, {
            "New board": () => {
                store.isAddingBoard = true;
            },
        });
    };

    React.useEffect(() => {
        auth.authenticate();
    }, []);

    if (auth.status === "failure") {
        return <RedirectAny to="/" />;
    }

    return (
        <Observer>
            {() => {
                if (auth.status === "failure") return <RedirectAny to="/" />;
                return (
                    <Container onContextMenu={onContextMenu}>
                        <Header>My boards</Header>
                        {store.isAddingBoard && <AddBoardModal />}
                        <BoardList />
                    </Container>
                );
            }}
        </Observer>
    );
});

const Container = styled.div`
    background-color: #eee;
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    overflow: auto;
`;
