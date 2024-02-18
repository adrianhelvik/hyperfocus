import { WithAuthProps, withAuth } from "authContext";
import withMenu, { WithMenuProps } from "withMenu";
import { Redirect } from "react-router-dom";
import AddBoardModal from "./AddBoardModal";
import Store, { StoreContext } from "store";
import React, { MouseEvent } from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import BoardList from "./BoardList";
import Header from "ui/Header";

const RedirectAny = Redirect as any;

type Props = WithAuthProps &
    WithMenuProps & {
        children?: React.ReactNode;
    };

@observer
class Overview extends React.Component<Props> {
    static contextType = StoreContext;
    declare context: Store;

    componentDidMount() {
        this.props.auth.authenticate();
    }

    onContextMenu = (event: MouseEvent) => {
        event.preventDefault();

        this.props.showMenu(event, {
            "New board": () => {
                this.context.isAddingBoard = true;
            },
        });
    };

    render() {
        if (this.props.auth.status === "failure") return <RedirectAny to="/" />;

        return (
            <Container onContextMenu={this.onContextMenu}>
                <Header>My boards</Header>
                {this.context.isAddingBoard && <AddBoardModal />}
                <BoardList />
            </Container>
        );
    }
}

export default withMenu(withAuth(Overview));

const Container = styled.div`
    background-color: #eee;
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    overflow: auto;
`;
