import styles from "./AddBoardModal.module.css";
import { batch, createSignal } from "solid-js";
import ModalFooter from "ui/ModalFooter";
import { v4 as uuid } from "uuid";
import * as store from "store";
import Button from "ui/Button";
import Input from "ui/Input";
import Modal from "ui/Modal";

export default function AddBoardModal() {
    const [title, setTitle] = createSignal("");

    function onSubmit(event: SubmitEvent) {
        event.preventDefault();
        batch(() => {
            store.createBoard({
                boardId: uuid(),
                title: title(),
            });
            setTitle("");
            store.stopAddingBoard();
        });
    }

    return (
        <form onSubmit={onSubmit}>
            <Modal hide={store.stopAddingBoard}>
                <h2 class={styles.title}>Name your board</h2>
                <Input
                    placeholder="Enter a name"
                    onChange={setTitle}
                    value={title}
                    autoFocus
                />
                <ModalFooter>
                    <Button $gray type="button" onClick={store.stopAddingBoard}>
                        Cancel
                    </Button>
                    <Button>Create</Button>
                </ModalFooter>
            </Modal>
        </form>
    );
}
