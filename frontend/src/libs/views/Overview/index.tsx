import { AuthContext, WithAuthProps } from "src/libs/authContext";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { StoreContext } from "src/libs/store";
import { Redirect } from "react-router-dom";
import AddBoardModal from "./AddBoardModal";
import React, { MouseEvent } from "react";
import Header from "src/libs/ui/Header";
import styled from "styled-components";
import { Observer } from "mobx-react";
import BoardList from "./BoardList";

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
    }, [auth]);

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
