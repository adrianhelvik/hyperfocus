import renderToBody from "util/renderToBody";
import { observable, action, reaction } from "mobx";
import styled from "styled-components";
import { observer } from "mobx-react";
import * as theme from "theme";
import Deck from "store/Deck";
import Card from "store/Card";
import Color from "color";
import React from "react";
import api, { addCardImages } from "api";

type Props = {
    deck: Deck;
    innerRef: (input: HTMLInputElement) => void;
    isPortal?: boolean;
    referencedByPortal?: boolean;
};

@observer
class AddCardInput extends React.Component<Props> {
    @observable title = "";
    @observable.ref images: File[] | null = null;
    @observable.ref imagesContainer: HTMLDivElement | null = null;

    input: HTMLInputElement;
    warningOpen: boolean;

    @action.bound setTitle(event: { target: { value: string } }) {
        this.title = event.target.value;
    }

    disposers: Array<() => void> = [];

    componentDidMount() {
        this.disposers.push(reaction(() => this.images, () => {
            this.imagesContainer.innerHTML = "";
            if (!this.images) return;
            for (const file of this.images) {
                const reader = new FileReader();
                const img = document.createElement("img");
                reader.onload = event => {
                    img.src = event.target.result.toString();
                };
                reader.readAsDataURL(file);
                this.imagesContainer.append(img);
            }
            this.imagesContainer.dataset.count = String(this.images.length);
        }));
    }

    componentWillUnmount() {
        this.disposers.forEach(fn => fn());
    }

    @action.bound setImages(images: File[]) {
        this.images = images;
    }

    onSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault();

        await this.save();
    };

    save = async () => {
        if (!this.title && !this.images?.length) {
            this.warn("The input field can not be empty");
            return;
        }

        const { cardId } = await api.addCard({
            title: this.title,
            deckId: this.props.deck.deckId,
        });

        const images = this.images
            ? await addCardImages(cardId, this.images)
            : [];

        const card = new Card(this.title, cardId, images);

        this.props.deck.addCard(card);
        this.title = "";
        this.images = null;
    };

    inputRef = (input: HTMLInputElement) => {
        this.input = input;
        this.props.innerRef(input);
    };

    warn(warning: string) {
        if (this.warningOpen) return;
        this.warningOpen = true;
        const { left, top, height } = this.input.getBoundingClientRect();
        const duration = 3000;
        let style = {
            position: "fixed" as const,
            top: top + height + 4,
            left,
            width: this.input.parentElement.clientWidth,
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
            <div style={style}>{warning}</div>,
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

    submitIfEnter = async (event: {
        which: number;
        preventDefault: () => void;
    }) => {
        if (event.which !== 13) return;

        event.preventDefault();

        await this.save();
    };

    render() {
        return (
            <>
                <Container onSubmit={this.onSubmit} data-add-card-input onDrop={e => {
                    const files = [];
                    for (const item of Array.from(e.dataTransfer.items)) {
                        if (item.kind === "file" && item.type.split("/")[0] === "image") {
                            files.push(item.getAsFile());
                        }
                    }
                    if (files.length) {
                        e.preventDefault();
                        this.setImages(files);
                    }
                }}>
                    <Input
                        onKeyDown={this.submitIfEnter}
                        value={this.title}
                        onChange={this.setTitle}
                        placeholder="Add card"
                        ref={this.inputRef}
                    />
                    <input type="file" hidden={true} name="image" onChange={e => this.setImages(Array.from(e.target.files))} multiple={true} />
                    <IconButton
                        type="button"
                        onClick={(e: any) => {
                            console.log(e.target.previousSibling);
                            e.target.previousSibling.click()
                            this.input.focus();
                        }}
                        $color={
                            this.props.isPortal
                                ? theme.secondary1
                                : this.props.referencedByPortal
                                    ? theme.tertiary1
                                    : this.props.deck.color || theme.defaultDeckColor
                        }
                    >
                        <Icon className="material-icons">image</Icon>
                    </IconButton>
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
                <ImagesContainer ref={e => this.imagesContainer = e} />
            </>
        );
    }
}

export default AddCardInput;

const Container = styled.form`
    display: flex;
`;

const Input = styled.input`
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

const Button = styled.button<{
    $color: string;
    isPortal?: boolean;
    referencedByPortal?: boolean;
}>`
    background: ${(p) => p.$color};
    border: none;
    color: ${(p) =>
        Color(p.$color).blacken(0.7).isDark() ? "white" : "black"};
    margin: 3px;
    border-radius: 4px;
    padding: 8px 12px;
    align-self: end;
`;


const IconButton = styled.button<{ $color: string }>`
    border: none;
    height: 30px;
    display: block;
    margin: auto;
    border-radius: 4px;

    background: ${(p) => p.$color};
    color: ${(p) =>
        Color(p.$color).blacken(0.7).isDark() ? "white" : "black"};
`

const Icon = styled.i`
    margin: 3px;
    pointer-events: none;
`

const ImagesContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    & img {
        width: 50%;
        max-height: 200px;
        object-fit: contain;
    }

    &[data-count="1"] img {
        width: 100%;
    }
`
