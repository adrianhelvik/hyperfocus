import { styled, css } from "solid-styled-components";
import * as zIndexes from "zIndexes";
import * as theme from "theme";
import Color from "color";
import Card from "./Card";

export default function DeckView(props: any) {
    return <Container>
    </Container>;
}

const Container = styled.div<{ lifted: any; moving: any }>`
    user-select: none;
    flex-shrink: 0;
    flex-grow: 0;
    background: white;
    border-radius: 4px;
    width: 250px;
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
    background: #eee;
`;

const StyledCard = styled(Card)`
    border-bottom: 1px solid #ddd;
    padding: 10px;
    font-size: 0.8rem;
    line-height: 15px;
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
