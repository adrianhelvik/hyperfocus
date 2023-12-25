import { styled, css } from "solid-styled-components";
import { Deck, Portal } from "store/types";
import { For, createMemo } from "solid-js";
import * as zIndexes from "zIndexes";
import MenuIcon from "ui/MenuIcon";
import * as theme from "theme";
import Card from "./Card";
import Color from "color";
import api from "api";

export default function DeckView(props: { deck: Deck | Portal }) {
    const deck = createMemo(() => {
        return props.deck;
    });

    return (
        <Container $moving={false}>
            <style>
                {".moving-deck { pointer-events: none; user-select: none; }"}
            </style>
            <TopBar color={deck().color}>
                <Title>
                    <TextArea
                        value={deck().title}
                        onBlur={(e) => {
                            api.setDeckTitle({
                                deckId: deck().deckId,
                                title: e.target.value,
                            });
                            // XXX: Code smell
                            deck().title = e.target.value;
                        }}
                    />
                    <For each={(deck() as Portal).portals ?? []}>
                        {(portal: any) => (
                            <ReferencedBy>
                                <Arrow>→</Arrow>
                                <ReferenceBoardTitle>
                                    {portal.boardTitle}
                                </ReferenceBoardTitle>
                                <ReferenceDeckTitle>
                                    {portal.title}
                                </ReferenceDeckTitle>
                            </ReferencedBy>
                        )}
                    </For>
                </Title>
                <MenuIcon onClick={() => {}} />
            </TopBar>
            <Body>
                <For each={deck().cards}>{(card) => <Card card={card} />}</For>
                {/*
          {Boolean(
            sharedState.moving.length &&
              this.hoverIndex === this.props.deck.cards.length,
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
          */}
            </Body>
            <AddCardInput
                deck={props.deck}
                isPortal={Boolean(props.deck.type === "portal")}
            />
        </Container>
    );
}

const AddCardInput = (() => null) as any;

const Container = styled.div<{ $moving: boolean }>`
    user-select: none;
    flex-shrink: 0;
    flex-grow: 0;
    background: white;
    border-radius: 4px;
    width: 250px;
    box-shadow: ${theme.shadows[0]};
    z-index: ${(p) => (p.$moving ? zIndexes.moving : zIndexes.movable)};
`;

const Title = styled.div`
    flex-grow: 1;
`;

const Body = styled.div`
    background: #eee;
`;

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

const TopBar = styled.div`
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
    border-bottom: 1px solid #ddd;
    padding: 10px;
    cursor: move;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
`;

const TextArea = styled.textarea`
    background-color: transparent;
    font-size: inherit;
    color: inherit;
    display: block;
    resize: none;
    width: 80%;
    border: 0;
`;
