import styled, { keyframes, css } from "styled-components";
import useOnKeyDown from "src/util/useOnKeyDown";
import { useAutoEffect } from "hooks.macro";
import useModal from "src/libs/useModal";
import * as theme from "src/libs/theme";
import { useBoard } from "./context";
import AddPortal from "./AddPortal";
import { useState } from "react";
import AddDeck from "./AddDeck";
import Help from "src/libs/ui/Help";
import Color from "color";

export default function AddCircle() {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const { showModal, renderModal } = useModal();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const board = useBoard();

  const addDeck = async () => {
    if (!board) return;
    showModal({
      title: "Create a deck",
      Template: (props) => <AddDeck {...props} board={board} />
    });
  };

  const addPortal = async () => {
    if (!board) return;
    await showModal({
      width: 700,
      title: <>
        Create a portal
        <Help>
          <p>
            A portal is a link to a deck from another board.
          </p>
          <p>
            With portals you becomes easier to move cards from one board to another.
          </p>
        </Help>
      </>,
      Template: (props) => <AddPortal {...props} index={null} />
    });
  };

  useOnKeyDown((e) => {
    if (open) {
      if (e.key === "Escape") {
        setOpen(false);
      }
      if (!e.ctrlKey && !e.metaKey && e.key === "d") {
        e.preventDefault();
        setOpen(false);
        addDeck();
      }
      if (!e.ctrlKey && !e.metaKey && e.key === "p") {
        e.preventDefault();
        setOpen(false);
        addPortal();
      }
    } else {
      if (e.target instanceof HTMLInputElement) return;
      if (e.target instanceof HTMLTextAreaElement) return;

      if (!e.ctrlKey && !e.metaKey && e.key === "+") {
        setOpen(true);
      }
    }
  });

  useAutoEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 400);
    return () => {
      clearTimeout(timeout);
    };
  });

  useAutoEffect(() => {
    if (!open) return;

    const onDocumentClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      if (container?.contains(event.target)) {
        return;
      }

      setOpen(false);
    };

    const timeout = setTimeout(() => {
      document.addEventListener("click", onDocumentClick);
    }, 500);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", onDocumentClick);
    };
  });

  return (
    <Container
      onClick={() => setOpen((open) => !open)}
      ref={(e) => setContainer(e)}
      $mounted={mounted}
      $open={open}
    >
      <Content $open={open} $mounted={mounted}>
        <AddItem onClick={addDeck}>
          <AddItemText>Add deck</AddItemText>
          <AddItemShortcut>d</AddItemShortcut>
        </AddItem>
        <AddItem onClick={addPortal}>
          <AddItemText>Add portal</AddItemText>
          <AddItemShortcut>p</AddItemShortcut>
        </AddItem>
      </Content>
      <VerticalLine $mounted={mounted} $open={open} />
      <HorizontalLine $mounted={mounted} $open={open} />
      {renderModal()}
    </Container>
  );
}

const overlayColor = Color(theme.baseColor).mix(Color("white"), 0.3);
const lightOverlayColor = Color(theme.baseColor).mix(Color("white"), 0.3);

const diameter = 60;
const height = 140;
const width = 200;

const Container = styled.div<{ $open: boolean; $mounted: boolean }>`
  background-color: ${theme.baseColor};
  color: ${Color(theme.baseColor).isDark() ? "white" : "black"};
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: ${diameter}px;
  height: ${diameter}px;
  text-align: center;
  border-radius: ${diameter}px;
  animation: ${(p) => (p.$open ? openAnimation : closeAnimation)}
    ${(p) => (p.$mounted ? ".3s" : "0s")};
  animation-fill-mode: forwards;
  cursor: pointer;
`;

const stage1 = css`
  border-radius: ${diameter};
  bottom: 20px;
  right: 20px;
  width: ${diameter}px;
`;

const stage2 = css`
  border-radius: 0;
  border-top-left-radius: 4px;
  bottom: 0px;
  right: 0px;
  width: ${width}px;
`;

const stage3 = css`
  height: ${height}px;
  width: ${width}px;
  bottom: 0px;
  right: 0px;
  border-radius: 0;
  border-top-left-radius: 4px;
`;

const openAnimation = keyframes`
  0% {
    ${stage1}
  }
  50% {
    ${stage2}
  }
  100% {
    ${stage3}
  }
`;

const closeAnimation = keyframes`
  0% {
    ${stage3}
  }
  50% {
    ${stage2}
  }
  100% {
    ${stage1}
  }
`;

const lineHeight = 20;
const lineWidth = 3;

const Line = styled.div<{ $open: boolean; $mounted: boolean }>`
  background-color: ${Color(theme.baseColor).isDark() ? "white" : "black"};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  pointer-events: none;
  animation: ${(p) => (p.$open ? lineOpen : lineClosed)}
    ${(p) => (p.$mounted ? ".3s" : "0s")};
  animation-fill-mode: forwards;
`;

const lineOpen = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const lineClosed = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const VerticalLine = styled(Line)`
  width: ${lineWidth}px;
  height: ${lineHeight}px;
`;

const HorizontalLine = styled(Line)`
  width: ${lineHeight}px;
  height: ${lineWidth}px;
`;

const Content = styled.div<{ $open: boolean; $mounted: boolean }>`
  transition: 0.3s;
  opacity: ${(p) => (p.$open ? 1 : 0)};
  pointer-events: ${(p) => !p.$open && "none"};
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AddItem = styled.div`
  background-color: ${overlayColor.string()};
  color: ${overlayColor.isDark() ? "white" : "black"};
  cursor: pointer;
  transition: 0.3s;
  padding: 10px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;

  &:hover {
    background: ${theme.ui2};
  }
`;

const AddItemText = styled.div``;

const AddItemShortcut = styled.div`
  background-color: ${lightOverlayColor.string()};
  border: 1px solid white;
  border-radius: 5px;
  padding: 5px 10px;
  font-weight: 100;
`;
