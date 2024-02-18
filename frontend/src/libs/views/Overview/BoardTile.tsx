import { CirclePicker as ColorPicker } from "react-color";
import Store, { StoreContext } from "src/libs/store";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { observer } from "mobx-react";
import withConfirm, { WithConfirmProps } from "withConfirm";
import onSelect from "util/onSelect";
import withStatus, { WithStatusProps } from "withStatus";
import MenuIcon from "ui/MenuIcon";
import withModal, { WithModalProps } from "withModal";
import withMenu, { WithMenuProps } from "withMenu";
import * as theme from "theme";
import Board from "store/Board";
import Color from "color";
import React, { MouseEvent } from "react";
import api from "api";

const ColorPickerAny = ColorPicker as any as React.ComponentType<any>;

const withRouterAny = withRouter as any as <T extends React.ComponentType<any>>(
    component: T,
) => T;

type Props = WithConfirmProps &
    WithStatusProps &
    WithMenuProps &
    WithModalProps &
    WithConfirmProps & {
        board: Board;
    };

@observer
class BoardTile extends React.Component<Props> {
    static contextType = StoreContext;
    declare context: Store;

    onSelect = () => {
        window.location.pathname = `/board/${this.props.board.boardId}`;
    };

    setColor = ({ hex }) => {
        this.props.board.color = hex;
        api.setBoardColor({
            boardId: this.props.board.boardId,
            color: hex,
        });
    };

    openMenu = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const nativeEvent: any = event.nativeEvent;
        this.props.showMenu(nativeEvent, {
            "Change color": async () => {
                this.props.showModalInPlace(nativeEvent, ({ resolve }) => (
                    <ColorPickerAny
                        onChange={(color: { hex: string }) => {
                            this.setColor(color);
                            resolve();
                        }}
                    />
                ));
            },
            Delete: async () => {
                if (
                    !(await this.props.confirmInPlace(nativeEvent, (p) => (
                        <div>
                            <div>Delete board permanently</div>
                            <button onClick={p.yes}>Yes</button>
                            <button onClick={p.no}>No</button>
                        </div>
                    )))
                )
                    return;
                const { boardId } = this.props.board;
                try {
                    await api.deleteBoard({
                        boardId,
                    });
                    this.context.deleteBoard(boardId);
                } catch (e) {
                    this.props.showStatus(() => (
                        <div>
                            Whoopsie! That caused an error!
                            <br />
                            <br />
                            <details>
                                <summary style={{ cursor: "pointer" }}>
                                    Error details
                                </summary>
                                <pre>{e.stack}</pre>
                            </details>
                        </div>
                    ));
                }
            },
        });
    };

    render() {
        return (
            <Container
                {...onSelect(this.onSelect)}
                $color={this.props.board.color || "white"}
                onContextMenu={this.openMenu}
            >
                <Title>{this.props.board.title || <Weak>Untitled</Weak>}</Title>
                <MenuIcon
                    $dark={!this.props.board.color}
                    onClick={this.openMenu}
                />
            </Container>
        );
    }
}

export default withModal(
    withConfirm(withStatus(withMenu(withRouterAny(BoardTile)))),
);

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
