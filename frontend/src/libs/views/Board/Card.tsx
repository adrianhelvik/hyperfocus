import withEvents, { WithEventsProps } from "src/libs/util/withEvents";
import withConfirm, { WithConfirmProps } from "src/libs/withConfirm";
import { action, observable, computed, runInAction } from "mobx";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import someParent from "src/libs/util/someParent";
import styled, { css } from "styled-components";
import * as zIndexes from "src/libs/zIndexes";
import Button from "src/libs/ui/Button";
import * as theme from "src/libs/theme";
import { elementToDeck } from "./Deck";
import { Portal } from "react-portal";
import { observer } from "mobx-react";
import api from "src/libs/api";
import React from "react";

export const elementToCard = observable.map();

export type OwnProps = {
    setMoving: (moving: boolean) => void;
    setHoverIndex: (index: number) => void;
    getLastHoverIndex: () => number;
    hoverIndex: number | null;
    placeholderWidth: number;
    placeholderHeight: number;
    deck: any;
    card: any;
    index: number;
    moving: boolean;
    className: string;
};

export type CardProps = WithConfirmProps &
    WithEventsProps &
    WithMenuProps &
    OwnProps;

@observer
class Card extends React.Component<CardProps> {
    @observable initialClientX = null;
    @observable initialClientY = null;
    @observable noPointer = false;
    @observable clientX = null;
    @observable clientY = null;
    @observable moving = false;
    @observable insetX = null;
    @observable insetY = null;

    removeElement: HTMLElement;
    element: HTMLElement;
    width: number;
    height: number;

    componentDidMount() {
        elementToCard.set(this.element, this);
    }

    componentWillUnmount() {
        elementToCard.delete(this.element);
    }

    @action.bound onMouseDown(event: {
        stopPropagation: () => void;
        target: EventTarget;
        clientX: number;
        clientY: number;
    }) {
        if (!(event.target instanceof Element)) return;

        event.stopPropagation();
        const { clientX, clientY } = event;

        // extract values
        const rect = this.element.getBoundingClientRect();
        this.initialClientX = this.clientX = clientX;
        this.initialClientY = this.clientY = clientY;
        this.insetX = rect.left - this.initialClientX;
        this.insetY = rect.top - this.initialClientY;
        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;

        // start moving
        this.moving = true;
        this.props.setMoving(true);
        this.props.setHoverIndex(this.props.index);

        this.props.on(document, "mousemove", (event) => {
            this.clientX = event.clientX;
            this.clientY = event.clientY;
        });

        this.props.on(document, "mouseup", (event) => {
            this.moving = false;
            this.props.setMoving(false);
            const { clientX, clientY } = event;
            const target = document.elementFromPoint(clientX, clientY);
            this.noPointer = false;

            this.props.setHoverIndex(null);
            const element = someParent(target, (e) => {
                return elementToDeck.has(e);
            });
            const otherDeckComponent = elementToDeck.get(element);

            if (otherDeckComponent) {
                const otherDeck = otherDeckComponent.props.deck;
                const index = this.props.getLastHoverIndex();
                const card = this.props.card;

                api.moveCard({
                    cardId: card.cardId,
                    source: this.props.deck.deckId,
                    target: otherDeck.deckId,
                    index,
                });

                runInAction(() => {
                    this.props.deck.removeCard(this.props.card);
                    otherDeck.addCard(this.props.card, index);
                });
            }

            this.props.off(document, "mousemove");
            this.props.off(document, "mouseup");
            this.clientX =
                this.clientY =
                this.initialClientX =
                this.initialClientY =
                    0;
        });
    }

    @computed get style() {
        if (this.moving)
            return {
                top: this.clientY,
                left: this.clientX,
                width: this.width,
                height: this.height,
                transform: `translateX(${this.insetX}px) translateY(${this.insetY}px)`,
            };
        return {};
    }

    @computed get deltaX() {
        return this.clientX - this.initialClientX;
    }

    @computed get deltaY() {
        return this.clientY - this.initialClientY;
    }

    remove = async (event: any) => {
        if (
            !(await this.props.confirmInPlace(event, (p) => (
                <div>
                    <div>Delete card?</div>
                    <div style={{ display: "flex", gap: 20 }}>
                        <Button $gray onClick={p.no}>
                            Cancel
                        </Button>
                        <Button $danger onClick={p.yes}>
                            Delete it
                        </Button>
                    </div>
                </div>
            )))
        )
            return;
        this.props.deck.removeCard(this.props.card);
        await api.deleteCard({
            cardId: this.props.card.cardId,
        });
    };

    template() {
        return (
            <div style={{ position: "relative" }}>
                <MenuIcon
                    ref={(e) => (this.removeElement = e)}
                    onClick={(e) => {
                        this.props.showMenu(e, {
                            Delete: (e) => this.remove(e),
                        });
                    }}
                >
                    <span className="material-symbols-outlined">menu</span>
                </MenuIcon>
                <Container
                    data-card={this.props.index}
                    ref={(e) => (this.element = e)}
                    className={this.props.className}
                    onMouseDown={this.onMouseDown}
                    noPointer={this.noPointer}
                    index={this.props.index}
                    moving={this.moving}
                    style={this.style}
                >
                    {Boolean(this.moving) && (
                        <style>{`body { user-select: none }`}</style>
                    )}
                    <Title>{this.props.card.title}</Title>
                    {this.props.card.images?.length > 0 && (
                        <Images
                            data-count={this.props.card.images?.length ?? 0}
                        >
                            {this.props.card.images?.map(
                                (image: string, i: number) => (
                                    <img key={i} src={image} />
                                )
                            )}
                        </Images>
                    )}
                </Container>
            </div>
        );
    }

    placeholder() {
        if (!this.props.moving) return null;

        return (
            <div
                data-card-placeholder={this.props.index}
                style={{
                    width: this.props.placeholderWidth,
                    height: this.props.placeholderHeight,
                }}
            />
        );
    }

    render() {
        const Wrapper = this.moving
            ? /* incorrect types in library */ (Portal as any)
            : React.Fragment;

        return (
            <OuterSpacing>
                {this.props.hoverIndex === this.props.index &&
                    this.placeholder()}
                <Wrapper>{this.template()}</Wrapper>
            </OuterSpacing>
        );
    }
}

export default withMenu(withConfirm(withEvents(Card)));

const OuterSpacing = styled.div`
    padding: 5px;
    padding-bottom: 0;
`;

const Container = styled.div<{
    noPointer: boolean;
    moving: boolean;
    index: number;
}>`
    background: white;
    position: ${(p) => (p.moving ? "fixed" : "relative")};
    transition: box-shadow 0.3s;
    z-index: ${(p) => (p.moving ? zIndexes.moving : zIndexes.movable)};
    border-radius: 4px;
    box-shadow: ${theme.shadows[0]};
    ${(p) =>
        p.moving &&
        css`
            pointer-events: none;
        `};
    ${(p) =>
        p.moving &&
        css`
            box-shadow: ${theme.shadows[1]};
        `};
    cursor: move;
    ::after {
        content: ${(p) => String(p.index)};
    }
`;

const Images = styled.div`
    img {
        vertical-align: top;
        max-width: 50%;
        pointer-events: none;
        max-height: 300px;
        box-shadow: ${theme.shadows[0]};
    }

    &[data-count="1"] img {
        max-width: 100%;
    }
`;

const Title = styled.div`
    white-space: pre-line;
    flex-grow: 1;
`;

const MenuIcon = styled.button`
    border: none;
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 10;

    background: ${theme.bg2};
    box-shadow: ${theme.shadows[0]};
    width: 25px;
    height: 25px;
    text-align: center;
    color: black;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    flex-grow: 0;
    align-self: flex-start;
    display: flex;
    align-items: center;
    justify-content: center;

    & > span {
        font-size: 18px;
        pointer-events: none;
    }

    transition: opacity 0.3s;
`;
