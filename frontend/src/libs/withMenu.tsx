import withEvents, { WithEventsProps } from "src/libs/util/withEvents";
import styled, { css, keyframes } from "styled-components";
import onSelect from "src/libs/util/onSelect";
import * as zIndexes from "src/libs/zIndexes";
import { useAutoEffect } from "hooks.macro";
import * as theme from "src/libs/theme";
import React, { useState } from "react";
import { Portal } from "react-portal";

const PortalAny = Portal as any;

export type WithMenuProps = {
  showMenu: (
    event: React.MouseEvent,
    options: Record<string, (e: { target: HTMLElement }) => void>
  ) => void;
};

export default function withMenu<Props>(
  WrappedComponent: React.ComponentType<Props & WithMenuProps>
): React.ComponentType<Props> {
  const openMenus: any[] = [];

  function NewComponent(props: WithEventsProps & Props) {
    const [showMenuTimeout, setShowMenuTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [menu, setMenu] = useState<HTMLElement | null>(null);
    const [options, setOptions] = useState<any>(null);
    const [x, setX] = useState<number | null>(null);
    const [y, setY] = useState<number | null>(null);
    const [id] = useState(() => crypto.randomUUID());

    useAutoEffect(() => {
      props.on(document, "click", (event) => {
        if (menu && !menu.contains(event.target)) closeMenu();
      });

      return () => {
        const index = openMenus.indexOf(id);
        if (index > -1) openMenus.splice(index, 1);
        if (showMenuTimeout) clearTimeout(showMenuTimeout);
      }
    });


    const showMenu = (
      event: { clientX: number; clientY: number },
      options: Record<string, (e: { target: HTMLElement }) => void>
    ) => {
      setShowMenuTimeout(setTimeout(() => {
        openMenus.forEach((menu) => {
          menu.closeMenu();
        });
        openMenus.push(id);
        setX(event.clientX);
        setY(event.clientY);
        setOptions(options);
      }, 100));
    };

    const closeMenu = () => {
      setOptions(null);
      setX(null);
      setY(null);
      const index = openMenus.indexOf(id);
      if (index > -1) openMenus.splice(index, 1);
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
            <MenuWrapper $x={x} $y={y} ref={(e) => setMenu(e)}>
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

const MenuWrapper = styled.div<{ $x: number | null; $y: number | null }>`
  position: fixed;
  ${p => p.$y && css`
    top: ${p.$y}px;
  `}
  ${p => p.$x && css`
    left: ${p.$x}px;
  `}
  background: white;
  min-height: 4px;
  width: 150px;
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
