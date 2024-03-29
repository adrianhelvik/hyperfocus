import requestAnimationFrameAsync from "src/libs/util/requestAnimationFrameAsync";
import withEvents, { WithEventsProps } from "src/libs/util/withEvents";
import withModal, { WithModalProps } from "src/libs/withModal";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { CirclePicker as ColorPicker } from "react-color";
import AbstractTextArea from "react-textarea-autosize";
import someParent from "src/libs/util/someParent";
import type DeckModel from "src/libs/store/Deck";
import styled, { css } from "styled-components";
import * as zIndexes from "src/libs/zIndexes";
import MenuIcon from "src/libs/ui/MenuIcon";
import { observable, computed } from "mobx";
import React, { ChangeEvent } from "react";
import Portal from "src/libs/store/Portal";
import AddCardInput from "./AddCardInput";
import sleep from "src/libs/util/sleep";
import * as theme from "src/libs/theme";
import { observer } from "mobx-react";
import api from "src/libs/api";
import Color from "color";
import Card from "./Card";
import EditDeckTitle from "./EditDeckTitle";

// XXX: The library uses a different version of @types/react
const ColorPickerAny = ColorPicker as any;

export const elementToDeck = observable.map();
const decks = observable.map();

class SharedState {
    @observable moving = observable.array();
    @observable lastHoverIndex = null;
}

const sharedState = new SharedState();

export type DeckProps = {
    deck: DeckModel;
    index: number;
    simulateMove(fromIndex: number, toIndex: number): void;
    move(fromIndex: number, toIndex: number): void;
    moveLeft: boolean;
    moveRight: boolean;
    delete: () => void;
    portal: Portal;
    className: string;
};

type Props = WithEventsProps & WithMenuProps & WithModalProps & DeckProps;

@observer
class Deck extends React.Component<Props> {
    @observable lastHoverIndex = null;
    @observable cardWith = null;
    @observable cardHeight = null;
    @observable hoverIndex = null;
    @observable hide = false;
    @observable justPlaced = false;
    @observable movingChild = false;
    @observable moving = false;
    @observable x = null;
    @observable y = null;
    @observable initialX = null;
    @observable initialY = null;
    @observable insetX = null;
    @observable insetY = null;

    input: HTMLInputElement;
    element: HTMLDivElement;
    initialRects: {
        width: number;
        height: number;
        left: number;
        right: number;
    }[];
    placeholderHeight: number;
    placeholderWidth: number;

    componentDidMount() {
        if (this.props.deck.initialFocus) {
            this.input.focus();
            this.props.deck.initialFocus = false;
        }
        decks.set(this, this.props.index);
        elementToDeck.set(this.element, this);
    }

    componentWillUnmount() {
        decks.delete(this);
        elementToDeck.delete(this.element);
    }

    @computed get deltaX() {
        if (!this.moving) return null;
        return this.x - this.initialX - this.insetX;
    }

    @computed get deltaY() {
        if (!this.moving) return 0;
        return this.y - this.initialY - this.insetY;
    }

    onMouseDown = (event: {
        button: number;
        clientX: number;
        clientY: number;
        target: EventTarget;
    }) => {
        if (!(event.target instanceof HTMLElement)) return;
        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "BUTTON" ||
            event.target.dataset.disableDrag ||
            event.button === 2
        )
            return;

        document.body.classList.add("moving-deck");

        this.calcInitialRects();

        const { clientX, clientY } = event;
        this.x = clientX;
        this.y = clientY;
        const rect = event.target.getBoundingClientRect();
        this.initialX = rect.left;
        this.initialY = rect.top;
        this.insetX = clientX - rect.left;
        this.insetY = clientY - rect.top;
        this.moving = true;

        this.props.on(document, "mousemove", (event) => {
            const { clientX, clientY } = event;
            this.x = clientX;
            this.y = clientY;

            const index = this.getNextIndex();
            this.props.simulateMove(this.props.index, index);
        });

        this.props.on(document, "mouseup", async () => {
            this.props.off(document, "mousemove");
            this.props.off(document, "mouseup");
            document.body.classList.remove("moving-deck");
            const nextIndex = this.getNextIndex();

            if (this.props.index === nextIndex) {
                this.props.simulateMove(null, null);
                this.justPlaced = false;
                this.moving = false;
                return;
            }

            await sleep(0);

            for (const [deck] of decks) deck.justPlaced = true;

            await requestAnimationFrameAsync();
            this.props.simulateMove(null, null);
            this.props.move(this.props.index, nextIndex);
            this.hide = true;
            this.moving = false;
            await requestAnimationFrameAsync();
            for (const [deck] of decks) deck.justPlaced = false;
            await requestAnimationFrameAsync();
            this.hide = false;
        });
    };

    calcInitialRects() {
        const container = document.querySelector(".board-decks");
        const elements = container.children;
        this.initialRects = [];

        for (let i = 0; i < elements.length; i++) {
            this.initialRects.push(elements[i].getBoundingClientRect());
        }
    }

    getNextIndex() {
        for (let i = 0; i < this.initialRects.length; i++) {
            const rect = this.initialRects[i];

            if (rect.left + rect.width >= this.x) {
                return i;
            }
        }

        return this.initialRects.length - 1;
    }

    @computed get style() {
        if (!this.moving) {
            let x: string | number = 0;
            if (this.props.moveLeft) x = `calc(-100% - 20px)`;
            if (this.props.moveRight) x = `calc(100% + 20px)`;
            return {
                opacity: this.hide ? "0" : "1",
                transition: this.justPlaced ? "0s" : "transform .3s",
                transform: `translateX(${x}) translateY(0)`,
            };
        }
        return {
            transition: "0s",
            transform: `translateX(${this.deltaX}px) translateY(${this.deltaY}px)`,
        };
    }

    setMoving = (movingChild: boolean) => {
        this.movingChild = movingChild;
        if (movingChild) sharedState.moving.push(this);
        else sharedState.moving.remove(this);
    };

    setHoverIndex = (index: number) => {
        this.hoverIndex = index;
        if (typeof index === "number") {
            this.lastHoverIndex = index;
            sharedState.lastHoverIndex = index;
        }
    };

    setPlaceholderHeight = (height: number) => {
        this.placeholderHeight = height;
    };

    setPlaceholderWidth = (width: number) => {
        this.placeholderWidth = width;
    };

    onMouseOver = (event: { target: EventTarget }) => {
        if (!(event.target instanceof HTMLElement)) return;
        if (!sharedState.moving.length) return;

        for (const attribute of ["data-card", "data-card-placeholder"]) {
            const element = someParent(event.target, (e) =>
                e.hasAttribute(attribute)
            );
            if (element instanceof HTMLElement) {
                this.setHoverIndex(Number(element.getAttribute(attribute)));
                this.setPlaceholderHeight(element.offsetHeight);
                this.setPlaceholderWidth(element.offsetWidth);
                return;
            }
        }
        const element = someParent(event.target, (e) =>
            e.hasAttribute("data-add-card-input")
        );
        if (element) {
            const max = this.props.deck.cards.length;
            this.setHoverIndex(max);
        } else {
            this.setHoverIndex(0);
        }
    };

    onMouseLeave = () => {
        this.setHoverIndex(null);
    };

    getLastHoverIndex = () => {
        return sharedState.lastHoverIndex;
    };

    openContextMenu = (event: {
        preventDefault: () => void;
        stopPropagation: () => void;
    }) => {
        event.preventDefault();
        event.stopPropagation();
        this.openMenu(event);
    };

    setColor = ({ hex }: { hex: string }) => {
        this.props.deck.color = hex;
        api.setDeckColor({
            deckId: this.props.deck.deckId,
            color: hex,
        });
    };

    openMenu = (event: any) => {
        console.log("Opening menu...");
        this.props.showMenu(event, {
            Delete: () => {
                this.props.delete();
            },
            "Change color": (event: any) => {
                this.props.showModalInPlace(event, ({ resolve }) => (
                    <ColorPickerAny
                        onChange={(color: { hex: string }) => {
                            this.setColor(color);
                            resolve();
                        }}
                    />
                ));
            },
        });
    };

    render() {
        return (
            <Container
                data-board-child={this.props.index}
                ref={(e) => (this.element = e)}
                className={this.props.className}
                onMouseOver={this.onMouseOver}
                onMouseLeave={this.onMouseLeave}
                onMouseDown={this.onMouseDown}
                movingChild={this.movingChild}
                moving={this.moving || this.movingChild}
                style={this.style}
            >
                <style>
                    {
                        ".moving-deck { pointer-events: none; user-select: none; }"
                    }
                </style>
                <TopBar
                    referencedByPortal={this.props.deck.referencedByPortal}
                    onContextMenu={this.openContextMenu}
                    color={this.props.deck.color}
                >
                    <Title>
                        {this.props.portal ? (
                            <React.Fragment>
                                <EditPortalTitle portal={this.props.portal} />
                                <ReferencedBy>
                                    <Arrow>←</Arrow>
                                    <ReferenceBoardTitle>
                                        {this.props.deck.boardTitle}
                                    </ReferenceBoardTitle>
                                    <ReferenceDeckTitle>
                                        {this.props.deck.title}
                                    </ReferenceDeckTitle>
                                </ReferencedBy>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <EditDeckTitle deck={this.props.deck} />
                                {this.props.deck.portals.map((portal) => (
                                    <ReferencedBy key={portal.portalId}>
                                        <Arrow>→</Arrow>
                                        <ReferenceBoardTitle>
                                            {portal.boardTitle}
                                        </ReferenceBoardTitle>
                                        <ReferenceDeckTitle>
                                            {portal.title}
                                        </ReferenceDeckTitle>
                                    </ReferencedBy>
                                ))}
                            </React.Fragment>
                        )}
                    </Title>
                    <MenuIcon onClick={this.openMenu} />
                </TopBar>
                <Body>
                    {this.props.deck.cards.map((card, index) => (
                        <StyledCard
                            key={card.cardId}
                            moving={Boolean(
                                this.moving ||
                                    this.movingChild ||
                                    sharedState.moving.length
                            )}
                            placeholderWidth={this.placeholderWidth}
                            placeholderHeight={this.placeholderHeight}
                            getLastHoverIndex={this.getLastHoverIndex}
                            setHoverIndex={this.setHoverIndex}
                            hoverIndex={this.hoverIndex}
                            setMoving={this.setMoving}
                            deck={this.props.deck}
                            index={index}
                            card={card}
                        />
                    ))}
                    {Boolean(
                        sharedState.moving.length &&
                            this.hoverIndex === this.props.deck.cards.length
                    ) && (
                        <div
                            data-card-placeholder={this.props.deck.cards.length}
                            style={{
                                width:
                                    this.placeholderWidth ||
                                    sharedState.moving[0].placeholderWidth,
                                height:
                                    this.placeholderHeight ||
                                    sharedState.moving[0].placeholderHeight,
                            }}
                        />
                    )}
                </Body>
                <AddCardInput
                    deck={this.props.deck}
                    innerRef={(e) => (this.input = e)}
                    isPortal={Boolean(this.props.portal)}
                    referencedByPortal={this.props.deck.referencedByPortal}
                />
            </Container>
        );
    }
}

export default withModal(withMenu(withEvents(Deck)));

const Container = styled.div<{
    moving: boolean;
    lifted?: boolean;
    ["data-board-child"]: number;
    movingChild: boolean;
}>`
    user-select: none;
    flex-shrink: 0;
    flex-grow: 0;
    background: white;
    border-radius: 4px;
    width: 300px;
    box-shadow: ${theme.shadows[0]};
    ${(p) =>
        p.lifted &&
        css`
            box-shadow: ${theme.shadows[1]};
        `};
    z-index: ${(p) => (p.moving ? zIndexes.moving : zIndexes.movable)};
`;

const Title = styled.div`
    flex-grow: 1;
`;

const Body = styled.div`
    background: ${theme.bg2};
`;

const StyledCard = styled(Card as any)`
    border-bottom: 1px solid #ddd;
    padding: 10px;
    font-size: 0.8rem;
    line-height: 15px;
` as any; // TODO: Fix types

const ReferencedBy = styled.div`
    font-size: 10px;
    line-height: 12px;
`;

const ReferenceBoardTitle = styled.span`
    margin-left: 3px;
    font-weight: bold;
    :after {
        content: ": ";
    }
`;

const ReferenceDeckTitle = styled.span``;

const Arrow = styled.span`
    font-weight: bold;
    font-size: 14px;
    position: relative;
    top: 1px;
    line-height: 12px;
`;

const TopBar = styled.div<{
    color: string;
    referencedByPortal: boolean;
}>`
    display: flex;
    background-color: ${(p) => {
        if (!p.color) return theme.defaultDeckColor;
        return p.color || theme.defaultDeckColor;
    }};
    color: ${(p) => {
        if (!p.color) return css`black`;
        try {
            if (Color(p.color).blacken(0.7).isDark()) {
                return "white";
            } else {
                return "black";
            }
        } catch (e) {
            console.error("Failed determine foreground color");
            return "black";
        }
    }};
    padding: 10px;
    cursor: move;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
`;

const TextArea = styled(AbstractTextArea as any /* TODO: Fix types */)`
    background-color: transparent;
    font-size: inherit;
    color: inherit;
    display: block;
    resize: none;
    width: 80%;
    border: 0;
`;

type EditPortalProps = {
    portal: Portal;
};

@observer
class EditPortalTitle extends React.Component<EditPortalProps> {
    saveTimeout: ReturnType<typeof setTimeout>;

    onChange = (event: ChangeEvent) => {
        if (!(event.target instanceof HTMLInputElement)) return;
        this.props.portal.title = event.target.value;
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            api.setPortalTitle({
                portalId: this.props.portal.portalId,
                title: this.props.portal.title,
            });
        }, 300);
    };

    render() {
        return (
            <TextArea
                value={this.props.portal.title}
                onChange={this.onChange}
            />
        );
    }
}
