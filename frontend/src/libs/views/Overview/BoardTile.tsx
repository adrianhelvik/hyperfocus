import withConfirm, { WithConfirmProps } from "src/libs/withConfirm";
import withStatus, { WithStatusProps } from "src/libs/withStatus";
import withModal, { WithModalProps } from "src/libs/withModal";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { CirclePicker as ColorPicker } from "react-color";
import React, { MouseEvent, useContext } from "react";
import { StoreContext } from "src/libs/store";
import MenuIcon from "src/libs/ui/MenuIcon";
import Board from "src/libs/store/Board";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import api from "src/libs/api";
import Color from "color";
import onSelect from "src/libs/util/onSelect";

const ColorPickerAny = ColorPicker as any as React.ComponentType<any>;

type Props = WithConfirmProps &
  WithStatusProps &
  WithMenuProps &
  WithModalProps &
  WithConfirmProps & {
    board: Board;
  };

function BoardTile(props: Props) {
  const store = useContext(StoreContext)!;

  const openBoard = () => {
    window.location.pathname = `/board/${props.board.boardId}`;
  };

  const setColor = ({ hex }: { hex: string }) => {
    props.board.color = hex;
    api.setBoardColor({
      boardId: props.board.boardId!,
      color: hex,
    });
  };

  const rename = (title: string) => {
    props.board.setTitle(title);
    api.setBoardTitle({
      boardId: props.board.boardId!,
      title,
    });
  };

  const openMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nativeEvent: any = event.nativeEvent;
    props.showMenu(nativeEvent, {
      Rename: () => {
        props.showModalInPlace(nativeEvent, ({ resolve }) => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              rename(
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
              defaultValue={props.board.title}
              autoFocus
            />
            <button>Save</button>
          </form>
        ));
      },
      "Change color": () => {
        props.showModalInPlace(nativeEvent, ({ resolve }) => (
          <ColorPickerAny
            onChange={(color: { hex: string }) => {
              setColor(color);
              resolve();
            }}
          />
        ));
      },
      Delete: async () => {
        if (
          !(await props.confirmInPlace(nativeEvent, (p) => (
            <div>
              <div>Delete board permanently</div>
              <button onClick={p.yes}>Yes</button>
              <button onClick={p.no}>No</button>
            </div>
          )))
        )
          return;
        const boardId = props.board.boardId!;
        try {
          await api.deleteBoard({
            boardId,
          });
          store.deleteBoard(boardId);
        } catch (e: any) {
          props.showStatus(() => (
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

  return (
    <Container
      {...onSelect(openBoard)}
      $color={props.board.color || "white"}
      onContextMenu={openMenu}
    >
      <Title>{props.board.title || <Weak>Untitled</Weak>}</Title>
      <MenuIcon $dark={!props.board.color} onClick={openMenu} />
    </Container>
  );
}

export default withModal(
  withConfirm(withStatus(withMenu(BoardTile)))
);

const Container = styled.button.attrs({
  type: "button",
}) <{ $color: string }>`
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

  &:hover {
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
