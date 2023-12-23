import * as store from "store";
import AddBoardModal from "./AddBoardModal";
import auth from "auth";
import styles from "./styles.module.css";
import BoardList from "./BoardList";
import withMenu from "withMenu";
import Header from "ui/Header";
import { createEffect } from "solid-js";

export default function Overview() {
    createEffect(() => {
        auth.authenticate();
    });
    const menu = withMenu();

    const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();

        menu.showMenu(event, {
            "New board": () => {
                store.setIsAddingBoard(true);
            },
        });
    };

    createEffect(() => {
        if (auth.status === "failure") window.location.href = "/";
    });

    return (
        <div onContextMenu={onContextMenu} class={styles.container}>
            <Header>My boards</Header>
            {store.isAddingBoard() && <AddBoardModal />}
            <BoardList />
        </div>
    );
}
