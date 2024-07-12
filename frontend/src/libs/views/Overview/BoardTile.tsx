import withConfirm, { WithConfirmProps } from "src/libs/withConfirm";
import withStatus, { WithStatusProps } from "src/libs/withStatus";
import withModal, { WithModalProps } from "src/libs/withModal";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { CirclePicker as ColorPicker } from "react-color";
import React, { MouseEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import onSelect from "src/libs/util/onSelect";
import MenuIcon from "src/libs/ui/MenuIcon";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import { Board } from "src/libs/types";
import api from "src/libs/api";
import Color from "color";
import { OverviewStoreContext } from "./OverviewStoreContext";

const ColorPickerAny = ColorPicker as any as React.ComponentType<any>;

type Props = WithConfirmProps &
  WithStatusProps &
  WithMenuProps &
  WithModalProps &
  WithConfirmProps & {
    board: Board;
    shortcut: string | null;
  };

function BoardTile(props: Props) {
  const { onBoardRemoved } = useContext(OverviewStoreContext);
  const navigate = useNavigate();

  const openBoard = () => {
    navigate(`/board/${props.board.boardId}`);
  };

  const setColor = ({ hex }: { hex: string }) => {
    api.setBoardColor({
      boardId: props.board.boardId!,
      color: hex,
    });
  };

  const rename = (title: string) => {
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
        api.deleteBoard({ boardId: props.board.boardId });
        onBoardRemoved(props.board);
      },
    });
  };

  return (
    <Container
      {...onSelect(openBoard)}
      $color={props.board.color || "white"}
      onContextMenu={openMenu}
    >
      <Title>
        {props.board.title || <Weak>Untitled</Weak>}
      </Title>
      <TopRight>
        {props.shortcut != null && <ShortcutIcon>{props.shortcut}</ShortcutIcon>}
        <MenuIcon $dark={!props.board.color} onClick={openMenu} />
      </TopRight>
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
  width: 100%;
  box-sizing: border-box;

  cursor: pointer;
  padding: 10px;
  display: flex;
  background: ${(p) => p.$color};
  color: ${(p) => (Color(p.$color).blacken(0.7).isDark() ? "white" : "black")};
  border-radius: 4px;
  margin-right: 10px;
  margin-bottom: 10px;
  position: relative;
  box-shadow: ${theme.shadows[0]};
  transition: box-shadow 0.3s;
  height: 80px;
  transform: translate3d(0, 0, 0);

  &:hover {
    box-shadow: ${theme.shadows[1]};
  }
`;

const Title = styled.div`
  overflow: hidden;
  width: 100%;

  /* This will cause the text to flow around he menu and shortcut icon */
  &::before {
    content: "";
    float: right;
    width: 60px;
    height: 27px;
    vertical-align: top;
  }
`;

const Weak = styled.span`
  color: ${theme.placeholderGray};
`;

const TopRight = styled.div`
  display: flex;
  float: right;
  position: fixed;
  top: 10px;
  right: 10px;
  align-items: center;
`;

const ShortcutIcon = styled.div`
  color: #aaa;
  padding: 0 5px;
`;
