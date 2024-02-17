import TextArea from "react-textarea-autosize";
import renderToBody from "util/renderToBody";
import { observable, action } from "mobx";
import styled from "styled-components";
import { observer } from "mobx-react";
import * as theme from "theme";
import Card from "store/Card";
import Color from "color";
import React from "react";
import api from "api";

@observer
class AddCardInput extends React.Component {
    @observable title = "";

    @action.bound setTitle(event) {
        this.title = event.target.value;
    }

    onSubmit = async (event) => {
        event.preventDefault();

        await this.save();
    };

    save = async () => {
        if (!this.title) {
            this.warn("The input field can not be empty");
            return;
        }

        const { cardId } = await api.addCard({
            title: this.title,
            deckId: this.props.deck.deckId,
        });

        const card = new Card(this.title, cardId);
        this.props.deck.addCard(card);
        this.title = "";
    };

    inputRef = (input) => {
        this.input = input;
        if (typeof this.props.innerRef === "function") {
            this.props.innerRef(input);
        }
    };

    warn(warning) {
        if (this.warningOpen) return;
        this.warningOpen = true;
        const { left, top, height } = this.input.getBoundingClientRect();
        const duration = 3000;
        let style = {
            position: "fixed",
            top: top + height + 4,
            left,
            width: this.input.parentNode.clientWidth,
            backgroundColor: "#eee",
            zIndex: 1000,
            fontSize: "0.8rem",
            padding: "5px",
            boxShadow: theme.shadows[0],
            transform: "scale(0)",
            transformOrigin: "50% 0",
            transition: "transform .3s",
        };

        const { remove, rerender } = renderToBody(
            <div style={style}>{warning}</div>
        );

        setTimeout(() => {
            style = { ...style, transform: "scale(1)" };
            rerender(<div style={style}>{warning}</div>);
        }, 100);
        setTimeout(() => {
            style = { ...style, transform: "scale(0)" };
            rerender(<div style={style}>{warning}</div>);
        }, duration - 300);
        setTimeout(() => {
            this.warningOpen = false;
            remove();
        }, duration);
    }

    submitIfEnter = async (event) => {
        if (event.which !== 13) return;

        event.preventDefault();

        await this.save();
    };

    render() {
        return (
            <Container onSubmit={this.onSubmit} data-add-card-input>
                <Input
                    onKeyDown={this.submitIfEnter}
                    value={this.title}
                    onChange={this.setTitle}
                    placeholder="Add card"
                    ref={this.inputRef}
                />
                <Button
                    isPortal={this.props.isPortal}
                    referencedByPortal={this.props.referencedByPortal}
                    $color={
                        this.props.isPortal
                            ? theme.secondary1
                            : this.props.referencedByPortal
                            ? theme.tertiary1
                            : this.props.deck.color || theme.defaultDeckColor
                    }
                >
                    Add
                </Button>
            </Container>
        );
    }
}

export default AddCardInput;

const Container = styled.form`
    display: flex;
`;

const Input = styled(TextArea)`
    flex-grow: 1;
    resize: none;
    border: none;
    padding: 10px;
    display: block;
    border-radius: 4px;
    width: 100%;
    :focus {
        outline: none;
    }
`;

const Button = styled.button`
    background: ${(p) => p.$color};
    border: none;
    color: ${(p) =>
        Color(p.$color).blacken(0.7).isDark() ? "white" : "black"};
    margin: 3px;
    border-radius: 4px;
    padding: 8px 12px;
    align-self: end;
`;
