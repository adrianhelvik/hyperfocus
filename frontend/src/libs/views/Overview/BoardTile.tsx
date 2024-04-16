import withConfirm, { WithConfirmProps } from "src/libs/withConfirm";
import withStatus, { WithStatusProps } from "src/libs/withStatus";
import withModal, { WithModalProps } from "src/libs/withModal";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { CirclePicker as ColorPicker } from "react-color";
import Store, { StoreContext } from "src/libs/store";
import { withRouter } from "react-router-dom";
import onSelect from "src/libs/util/onSelect";
import MenuIcon from "src/libs/ui/MenuIcon";
import React, { MouseEvent } from "react";
import Board from "src/libs/store/Board";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import { observer } from "mobx-react";
import api from "src/libs/api";
import Color from "color";

const ColorPickerAny = ColorPicker as any as React.ComponentType<any>;

const withRouterAny = withRouter as any as <T extends React.ComponentType<any>>(
  component: T
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

  rename = (title: string) => {
    this.props.board.setTitle(title);
    api.setBoardTitle({ boardId: this.props.board.boardId, title });
  };

  openMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nativeEvent: any = event.nativeEvent;
    this.props.showMenu(nativeEvent, {
      Rename: () => {
        this.props.showModalInPlace(nativeEvent, ({ resolve }) => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              this.rename(
                (
                  (e.target as HTMLFormElement).elements.namedItem(
                    "newBoardTitle"
                  ) as HTMLInputElement
                ).value
              );
              resolve();
            }}
          >
            <div>Enter new name</div>
            <input
              name="newBoardTitle"
              defaultValue={this.props.board.title}
              autoFocus
            />
            <button>Save</button>
          </form>
        ));
      },
      "Change color": () => {
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
                <summary style={{ cursor: "pointer" }}>Error details</summary>
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
        <MenuIcon $dark={!this.props.board.color} onClick={this.openMenu} />
      </Container>
    );
  }
}

export default withModal(
  withConfirm(withStatus(withMenu(withRouterAny(BoardTile))))
);

const Container = styled.button.attrs({
  type: "button",
})<{ $color: string }>`
  all: unset;
  outline: revert;

  cursor: pointer;
  padding: 10px;
  background: ${(p) => p.$color};
  color: ${(p) => (Color(p.$color).blacken(0.7).isDark() ? "white" : "black")};
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
