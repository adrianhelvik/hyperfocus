import withEvents, { WithEventsProps } from "src/libs/util/withEvents";
import styled, { css, keyframes } from "styled-components";
import React, { useEffect, useState } from "react";
import onSelect from "src/libs/util/onSelect";
import * as zIndexes from "src/libs/zIndexes";
import { useAutoEffect } from "hooks.macro";
import { mixBlackWhite } from "./colorFns";
import * as theme from "src/libs/theme";
import { createPortal } from "react-dom";
import useStableCallback from "src/util/useStableCallback";

const MENU_WIDTH = 150;

type MenuOptions = Record<string, ((e: { target: HTMLElement }) => void) | undefined | false | null>;

export type ShowMenuFn = (
  event: React.MouseEvent | MouseEvent,
  options: MenuOptions
) => void;

export type WithMenuProps = {
  showMenu: ShowMenuFn;
};

export default function withMenu<Props>(
  WrappedComponent: React.ComponentType<Props & WithMenuProps>
): React.ComponentType<Props> {
  function NewComponent(props: WithEventsProps & Props) {
    const [showMenuTimeout, setShowMenuTimeout] = useState<ReturnType<
      typeof setTimeout
    > | null>(null);
    const [menu, setMenu] = useState<HTMLElement | null>(null);
    const [options, setOptions] = useState<null | MenuOptions>(null);
    const [dir, setDir] = useState<"right" | "left">("right");
    const [x, setX] = useState<number | null>(null);
    const [y, setY] = useState<number | null>(null);
    const [id] = useState(() => crypto.randomUUID());

    const closeMenu = () => {
      setOptions(null);
      setX(null);
      setY(null);
    };

    const selectItem = (e: { target: HTMLElement }) => {
      const key = e.target.getAttribute("data-key");
      if (!key) return;
      if (options?.[key]) {
        options[key](e);
      }
      closeMenu();
    };

    useEffect(() => {
      if (x == null) return;
      if (x + MENU_WIDTH > window.innerWidth) {
        setDir("right");
      } else {
        setDir("left");
      }
    }, [x]);

    useAutoEffect(() => {
      if (!menu) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          closeMenu();
        }
      };

      const timeout = setTimeout(() => {
        document.addEventListener("keyup", onKeyDown);
      }, 100);

      return () => {
        clearTimeout(timeout);
        document.removeEventListener("keyup", onKeyDown);
      };
    });

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

    const showMenu = useStableCallback((
      event: { clientX: number; clientY: number, target?: unknown, pointerId?: number },
      options: MenuOptions,
    ) => {
      if (event.pointerId === -1 && (event.target instanceof HTMLElement)) {
        const rect = event.target.getBoundingClientRect();

        event = {
          clientX: rect.left,
          clientY: rect.top + rect.height,
        };
      }

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
    });

    useAutoEffect(() => {
      if (menu && options) {
        if (menu.children[0] instanceof HTMLElement) {
          menu.children[0].focus();
        }
      }
    });

    useAutoEffect(() => {
      if (!menu || !options) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (!document.activeElement) return;
        if (!menu) return;

        switch (event.key) {
          case "ArrowUp": {
            event.preventDefault();
            const index = Array.from(menu.children).indexOf(document.activeElement);
            const nextChild = menu.children[index - 1]
            if (nextChild instanceof HTMLElement) {
              nextChild.focus();
            }
            break;
          }
          case "ArrowDown": {
            event.preventDefault();
            const index = Array.from(menu.children).indexOf(document.activeElement);
            const prevChild = menu.children[index + 1]
            if (prevChild instanceof HTMLElement) {
              prevChild.focus();
            }
            break;
          }
        }
      };

      document.addEventListener("keydown", onKeyDown);

      return () => {
        document.removeEventListener("keydown", onKeyDown);
      };
    });

    return (
      <>
        <WrappedComponent {...props} showMenu={showMenu} />
        {createPortal(
          <div>
            {options && (
              <MenuWrapper $x={x} $y={y} $dir={dir} ref={(e) => setMenu(e)}>
                {Object.keys(options).map((key, index) => (
                  options[key] &&
                  <MenuItem
                    ref={(e) => index === 0 && e && e.focus()}
                    {...onSelect(selectItem)}
                    data-prevent-grid-keyboard-navigation
                    data-disable-drag
                    data-key={key}
                    key={key}
                  >
                    {key}
                  </MenuItem>
                ))}
              </MenuWrapper>
            )}
          </div>,
          document.body
        )}
      </>
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
  color: ${mixBlackWhite(theme.baseColor, 0.8, 0.1)};
  border-radius: 4px;
  z-index: ${zIndexes.overlaidMenu};
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
    background-color: ${mixBlackWhite(theme.baseColor, 0.2, 0.7)};
  }

  &:focus {
    outline: none;
    background-color: ${mixBlackWhite(theme.baseColor, 0.4, 0.7)};
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
