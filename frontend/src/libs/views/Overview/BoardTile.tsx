import showMenu from "showMenu";
import { styled } from "solid-styled-components";
import MenuIcon from "ui/MenuIcon";
import * as theme from "theme";
import Color from "color";
import api from "api";
import { Board } from "store/types";
import * as store from "store";

export default function BoardTile(props: { board: Board }) {
    const setColor = ({ hex }: { hex: string }) => {
        store.setBoardColor(props.board.boardId, hex);
        api.setBoardColor({
            boardId: props.board.boardId,
            color: hex,
        });
    };

    // TODO
    const confirmInPlace = (_event: any, _callback: (args: { yes: () => void, no: () => void }) => void) => {
        return Promise.resolve(false);
    };

    // TODO
    const showStatus = (_fn: () => any) => {};

    const openMenu = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        showMenu(event, {
            "Change color": async () => {
                const color = prompt("Enter a color");
                if (color) setColor({ hex: color });
            },
            Delete: async () => {
                if (
                    !(await confirmInPlace(event, (p) => (
                        <div>
                            <div>Delete board permanently</div>
                            <button onClick={p.yes}>Yes</button>
                            <button onClick={p.no}>No</button>
                        </div>
                    )))
                )
                    return;
                const { boardId } = props.board;
                try {
                    await api.deleteBoard({
                        boardId,
                    });
                    store.deleteBoard(boardId);
                } catch (e: unknown) {
                    const error = e instanceof Error ? e : Error(e as any);
                    showStatus(() => (
                        <div>
                            Whoopsie! That caused an error!
                            <br />
                            <br />
                            <details>
                                <summary style={{ cursor: "pointer" }}>
                                    Error details
                                </summary>
                                <pre>{error.stack}</pre>
                            </details>
                        </div>
                    ));
                }
            },
        });
    };

    return (
        <Container
            onClick={() => {
                window.location.pathname = `/board/${props.board.boardId}`;
            }}
            $color={props.board.color || "white"}
            onContextMenu={openMenu}
        >
            <Title>{props.board.title || <Weak>Untitled</Weak>}</Title>
            <MenuIcon $dark={!props.board.color} onClick={openMenu} />
        </Container>
    );
}

const Container = styled.div<{ $color: string }>`
    cursor: pointer;
    padding: 10px;
    background: ${(p) => p.$color};
    color: ${(p) =>
        Color(p.$color).blacken(0.7).isDark() ? "white" : "black"};
    border-radius: 4px;
    margin-right: 10px;
    margin-bottom: 10px;
    position: relative;
    display: inline-flex;
    box-shadow: ${theme.shadows[0]};
    transition: box-shadow 0.3s;
    height: 80px;

    :hover {
        box-shadow: ${theme.shadows[1]};
    }
`;

const Title = styled.div`
    overflow: hidden;
    width: 100%;
`;

const Weak = styled.span`
    color: ${theme.placeholderGray};
`;
