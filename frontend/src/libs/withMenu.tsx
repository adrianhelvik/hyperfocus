import withEvents, { WithEventsProps } from "src/libs/util/withEvents";
import styled, { css, keyframes } from "styled-components";
import onSelect from "src/libs/util/onSelect";
import * as zIndexes from "src/libs/zIndexes";
import { useAutoEffect } from "hooks.macro";
import * as theme from "src/libs/theme";
import React, { useEffect, useState } from "react";
import { Portal } from "react-portal";

const PortalAny = Portal as any;
const MENU_WIDTH = 150;

export type WithMenuProps = {
  showMenu: (
    event: React.MouseEvent,
    options: Record<string, (e: { target: HTMLElement }) => void>
  ) => void;
};

export default function withMenu<Props>(
  WrappedComponent: React.ComponentType<Props & WithMenuProps>
): React.ComponentType<Props> {
  function NewComponent(props: WithEventsProps & Props) {
    const [showMenuTimeout, setShowMenuTimeout] = useState<ReturnType<
      typeof setTimeout
    > | null>(null);
    const [menu, setMenu] = useState<HTMLElement | null>(null);
    const [options, setOptions] = useState<any>(null);
    const [dir, setDir] = useState<"right" | "left">("right");
    const [x, setX] = useState<number | null>(null);
    const [y, setY] = useState<number | null>(null);
    const [id] = useState(() => crypto.randomUUID());

    useEffect(() => {
      if (x == null) return;
      if (x + MENU_WIDTH > window.innerWidth) {
        setDir("right");
      } else {
        setDir("left");
      }
    }, [x]);

    useAutoEffect(() => {
      props.on(document, "click", (event) => {
        if (menu && !menu.contains(event.target)) closeMenu();
      });

      return () => {
        if (showMenuTimeout) {
          clearTimeout(showMenuTimeout);
        }
      };
    });

    useAutoEffect(() => {
      const handler = (event: any) => {
        if (event.id !== id) {
          closeMenu();
        }
      };
      window.addEventListener("hyperfocus:withMenu:showMenu", handler);
      return () => {
        window.removeEventListener("hyperfocus:withMenu:showMenu", handler);
      };
    });

    const showMenu = (
      event: { clientX: number; clientY: number },
      options: Record<string, (e: { target: HTMLElement }) => void>
    ) => {
      setShowMenuTimeout(
        setTimeout(() => {
          window.dispatchEvent(
            Object.assign(new Event("hyperfocus:withMenu:showMenu"), { id })
          );
          setX(event.clientX);
          setY(event.clientY);
          setOptions(options);
        }, 100)
      );
    };

    const closeMenu = () => {
      setOptions(null);
      setX(null);
      setY(null);
    };

    const selectItem = (e: { target: HTMLElement }) => {
      const key = e.target.getAttribute("data-key");
      if (!key) return;
      options[key](e);
      closeMenu();
    };

    return (
      <React.Fragment>
        <WrappedComponent {...props} showMenu={showMenu} />
        {options && (
          <PortalAny>
            <MenuWrapper $x={x} $y={y} $dir={dir} ref={(e) => setMenu(e)}>
              {Object.keys(options).map((key, index) => (
                <MenuItem
                  ref={(e) => index === 0 && e && e.focus()}
                  {...onSelect(selectItem)}
                  data-disable-drag
                  data-key={key}
                  key={key}
                >
                  {key}
                </MenuItem>
              ))}
            </MenuWrapper>
          </PortalAny>
        )}
      </React.Fragment>
    );
  }

  return withEvents(NewComponent);
}

const MenuWrapper = styled.div<{
  $x: number | null;
  $y: number | null;
  $dir: "left" | "right";
}>`
  position: fixed;

  ${(p) =>
    p.$dir === "left" &&
    css`
      ${p.$y &&
      css`
        top: ${p.$y}px;
      `}
      ${p.$x &&
      css`
        left: ${p.$x}px;
      `}
    `}

  ${(p) =>
    p.$dir === "right" &&
    css`
      ${p.$y &&
      css`
        top: ${p.$y}px;
      `}
      ${p.$x &&
      css`
        left: ${p.$x - MENU_WIDTH}px;
      `}
    `};

  background: white;
  min-height: 4px;
  width: ${MENU_WIDTH}px;
  box-shadow: ${theme.shadows[1]};
  font-size: 0.8rem;
  color: #707070;
  border-radius: 4px;
  z-index: ${zIndexes.contextMenu};
  overflow: hidden;

  animation: ${keyframes`
    0% {
      max-height: 0;
    }
    100% {
      max-height: 600px;
    }
  `} 0.7s;
`;

const MenuItem = styled.div`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background: ${theme.gray2};
  }

  &:focus {
    outline: none;
  }

  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;
