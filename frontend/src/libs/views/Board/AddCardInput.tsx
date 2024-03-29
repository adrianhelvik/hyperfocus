import RenderImageFile from "src/libs/ui/RenderImageFile";
import renderToBody from "src/libs/util/renderToBody";
import api, { addCardImages } from "src/libs/api";
import { observable, action } from "mobx";
import * as theme from "src/libs/theme";
import Deck from "src/libs/store/Deck";
import Card from "src/libs/store/Card";
import styled from "styled-components";
import { observer } from "mobx-react";
import Color from "color";
import React from "react";

type Props = {
    deck: Deck;
    innerRef: (input: HTMLInputElement) => void;
    isPortal?: boolean;
    referencedByPortal?: boolean;
};

@observer
class AddCardInput extends React.Component<Props> {
    @observable title = "";
    @observable.ref images: File[] = [];
    @observable.ref imagesContainer: HTMLDivElement | null = null;

    input: HTMLInputElement;
    warningOpen: boolean;

    @action.bound setTitle(event: { target: { value: string } }) {
        this.title = event.target.value;
    }

    disposers: Array<() => void> = [];

    componentWillUnmount() {
        this.disposers.forEach((fn) => fn());
    }

    @action.bound setImages(images: File[]) {
        this.images = [...this.images, ...images];
    }

    onSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        this.save();
        this.input.focus();
    };

    save = async () => {
        if (!this.title && !this.images?.length) {
            this.warn("The input field can not be empty");
            return;
        }

        const { title, props: { deck: { deckId } }, images } = this;

        this.title = "";
        this.images = [];

        const { cardId } = await api.addCard({
            title,
            deckId,
        });

        const imageUrls = images
            ? await addCardImages(cardId, images)
            : [];

        const card = new Card(title, cardId, imageUrls);

        this.props.deck.addCard(card);
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
                <InputsAndButtons
                    onSubmit={this.onSubmit}
                    data-add-card-input
                    onDrop={(e) => {
                        const files = [];
                        for (const item of Array.from(e.dataTransfer.items)) {
                            if (
                                item.kind === "file" &&
                                item.type.split("/")[0] === "image"
                            ) {
                                files.push(item.getAsFile());
                            }
                        }
                        if (files.length) {
                            e.preventDefault();
                            this.setImages(files);
                        }
                    }}
                >
                    <Input
                        onKeyDown={this.submitIfEnter}
                        value={this.title}
                        onChange={this.setTitle}
                        placeholder="Add card"
                        ref={this.inputRef}
                    />
                    <input
                        type="file"
                        hidden={true}
                        name="image"
                        onChange={(e) =>
                            this.setImages(Array.from(e.target.files))
                        }
                        multiple={true}
                    />
                    <IconButton
                        type="button"
                        onClick={(e: any) => {
                            console.log(e.target.previousSibling);
                            e.target.previousSibling.click();
                            this.input.focus();
                        }}
                        $color={
                            this.props.isPortal
                                ? theme.secondary1
                                : this.props.referencedByPortal
                                    ? theme.tertiary1
                                    : this.props.deck.color ||
                                    theme.defaultDeckColor
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
                                    : this.props.deck.color ||
                                    theme.defaultDeckColor
                        }
                    >
                        Add
                    </Button>
                </InputsAndButtons>
                {this.images.length > 0 && (
                    <ImagesOuterContainer>
                        <ImagesContainer data-count={this.images.length}>
                            {this.images.map((file, i) => (
                                <RenderImageFile file={file} key={i} />
                            ))}
                        </ImagesContainer>
                    </ImagesOuterContainer>
                )}
            </>
        );
    }
}

export default AddCardInput;

const InputsAndButtons = styled.form`
    display: flex;
    padding: 5px;
    background-color: ${theme.bg2};
`;

const Input = styled.input`
    flex-grow: 1;
    resize: none;
    border: none;
    padding: 10px;
    display: block;
    border-radius: 4px;
    width: 100%;
    box-shadow: ${theme.shadows[0]};
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
    cursor: pointer;
`;

const IconButton = styled.button<{ $color: string }>`
    background-color: transparent;
    border: none;
    padding: 0;
    color: ${(p) => p.$color};
    transition: color 300ms;
    cursor: pointer;

    :hover {
        color: ${(p) => Color(p.$color).darken(0.1).toString()};
    }

    :active:hover {
        color: ${(p) => Color(p.$color).darken(0.25).toString()};
    }
`;

const Icon = styled.i`
    margin: 3px;
    pointer-events: none;
`;

const ImagesContainer = styled.div`
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    flex-direction: row;

    &[data-count="0"] {
        display: none;
    }

    & img {
        box-shadow: ${theme.shadows[1]};
        width: 50px;
        height: 50px;
        border-radius: 1000px;
        max-height: 200px;
        object-fit: cover;
    }
`;

const ImagesOuterContainer = styled.div`
    padding: 5px;
`;
