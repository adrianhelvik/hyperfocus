import React, { ChangeEvent, FormEvent } from "react";
import Store, { StoreContext } from "store";
import { observable, action } from "mobx";
import ModalFooter from "ui/ModalFooter";
import styled from "styled-components";
import { observer } from "mobx-react";
import Board from "store/Board";
import Button from "ui/Button";
import Input from "ui/Input";
import Modal from "ui/Modal";

@observer
class AddBoardModal extends React.Component {
    static contextType = StoreContext;
    declare context: Store;

    @observable title = "";

    @action.bound setTitle(event: ChangeEvent<HTMLInputElement>) {
        this.title = event.target.value;
    }

    @action.bound onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        this.context.addBoard(new Board(this.title));
        this.title = "";
        this.context.stopAddingBoard();
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <Modal hide={this.context.stopAddingBoard}>
                    <Title>Name your board</Title>
                    <Input
                        placeholder="Enter a name"
                        onChange={this.setTitle}
                        value={this.title}
                        autoFocus
                    />
                    <ModalFooter>
                        <Button
                            $gray
                            type="button"
                            onClick={this.context.stopAddingBoard}
                        >
                            Cancel
                        </Button>
                        <Button>Create</Button>
                    </ModalFooter>
                </Modal>
            </form>
        );
    }
}

export default AddBoardModal;

const Title = styled.h2`
    font-weight: normal;
    margin: 0;
    margin-bottom: 20px;
    color: #333;
`;
