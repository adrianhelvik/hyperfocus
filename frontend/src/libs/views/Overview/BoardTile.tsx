import { ConfirmButtonRow, ConfirmHeader } from "src/libs/ui/confirm-dialog";
import withConfirm, { WithConfirmProps } from "src/libs/withConfirm";
import withStatus, { WithStatusProps } from "src/libs/withStatus";
import withModal, { WithModalProps } from "src/libs/withModal";
import { OverviewStoreContext } from "./OverviewStoreContext";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { CirclePicker as ColorPicker } from "react-color";
import { flattenColor } from "src/libs/colorFns";
import { MouseEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import onSelect from "src/libs/util/onSelect";
import MenuIcon from "src/libs/ui/MenuIcon";
import * as theme from "src/libs/theme";
import Button from "src/libs/ui/Button";
import styled from "styled-components";
import { Board } from "src/libs/types";
import Input from "src/libs/ui/Input";
import api from "src/libs/api";
import Color from "color";

type Props = WithConfirmProps &
  WithStatusProps &
  WithMenuProps &
  WithModalProps &
  WithConfirmProps & {
    board: Board;
    shortcut: string | null;
  };

function BoardTile(props: Props) {
  const { onBoardRemoved, onBoardColorChanged, onBoardTitleChanged } = useContext(OverviewStoreContext);
  const navigate = useNavigate();

  const openBoard = () => {
    navigate(`/board/${props.board.boardId}`);
  };

  const setColor = (color: string | null) => {
    api.setBoardColor({
      boardId: props.board.boardId!,
      color: color,
    });
    onBoardColorChanged(props.board.boardId, color);
  };

  const rename = (title: string) => {
    api.setBoardTitle({
      boardId: props.board.boardId!,
      title,
    });
    onBoardTitleChanged(props.board.boardId, title);
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
            <ConfirmHeader>Enter new name</ConfirmHeader>
            <Input
              name="newBoardTitle"
              defaultValue={props.board.title}
              autoFocus
            />
            <ConfirmButtonRow>
              <Button>Save</Button>
            </ConfirmButtonRow>
          </form>
        ));
      },
      "Change color": () => {
        props.showModalInPlace(nativeEvent, () => (
          <>
            <ColorPicker
              onChange={(color: { hex: string }) => {
                setColor(color.hex);
              }}
            />
          </>
        ));
      },
      "Clear color": props.board.color ? (() => {
        setColor(null);
      }) : undefined,
      Delete: async () => {
        if (
          !(await props.confirmInPlace(nativeEvent, (p) => (
            <>
              <ConfirmHeader>Delete board permanently?</ConfirmHeader>
              <ConfirmButtonRow>
                <Button $cancel onClick={p.no}>Cancel</Button>
                <Button onClick={p.yes}>Delete</Button>
              </ConfirmButtonRow>
            </>
          )))
        )
          return;
        api.deleteBoard({ boardId: props.board.boardId });
        onBoardRemoved(props.board);
      },
    });
  };

  const color = props.board.color || Color(theme.baseColor).alpha(0.2).string();

  return (
    <Container
      {...onSelect(openBoard)}
      $color={color}
      onContextMenu={openMenu}
      tabIndex={0}
    >
      <Title>{props.board.title || <Weak>Untitled</Weak>}</Title>
      <TopRight>
        {props.shortcut != null && (
          <ShortcutIcon $color={color}>{props.shortcut}</ShortcutIcon>
        )}
        <MenuIcon $dark={!props.board.color} onClick={openMenu} />
      </TopRight>
    </Container>
  );
}

export default withModal(withConfirm(withStatus(withMenu(BoardTile))));

const textColor = (p: { $color: string }) => {
  const flatColor = flattenColor(p.$color, "black");
  if (Color(flatColor).isDark()) {
    return "white";
  }
  return Color(p.$color).mix(Color("black"), 0.7).string();
}

const borderColor = (p: { $color: string }) => {
  const flatColor = flattenColor(p.$color, "black");
  if (Color(flatColor).isDark()) {
    return Color("white").alpha(0.2).string();
  }
  return Color(p.$color).mix(Color("black"), 0.2).string();
}

const Container = styled.div <{ $color: string }>`
  all: unset;
  outline: revert;
  width: 100%;
  box-sizing: border-box;

  cursor: pointer;
  padding: 10px;
  display: flex;
  background: ${(p) => p.$color};
  color: ${textColor};
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
    width: 88px;
    height: 34px;
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
  gap: 7px;
`;

const ShortcutIcon = styled.div<{ $color: string }>`
  color: ${textColor};
  padding: 4px 5px;
  border: 1px solid ${borderColor};
  border-radius: 5px;

  @media (hover: none) {
    display: none;
  }
`;
