import { CirclePicker as ColorPicker } from "react-color";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import withConfirm from "withConfirm";
import onSelect from "util/onSelect";
import withStatus from "withStatus";
import MenuIcon from "ui/MenuIcon";
import withModal from "withModal";
import withMenu from "withMenu";
import * as theme from "theme";
import Color from "color";
import React from "react";
import api from "api";

@withModal
@withConfirm
@withStatus
@withMenu
@withRouter
@inject("store")
@observer
class BoardTile extends React.Component {
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

    openMenu = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event = event.nativeEvent;
        this.props.showMenu(event, {
            "Change color": async () => {
                this.props.showModalInPlace(event, ({ resolve }) => (
                    <ColorPicker
                        onChange={(color) => {
                            this.setColor(color);
                            resolve();
                        }}
                    />
                ));
            },
            Delete: async () => {
                if (
                    !(await this.props.confirmInPlace(event, (p) => (
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
                    this.props.store.deleteBoard(boardId);
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

export default BoardTile;

const Container = styled.div`
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
