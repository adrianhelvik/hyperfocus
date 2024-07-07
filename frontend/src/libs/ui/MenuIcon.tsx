import styled, { css } from "styled-components";
import { MouseEventHandler } from "react";
import * as theme from "src/libs/theme";

const MenuIcon = ({
  onClick,
  $dark,
}: {
  onClick: MouseEventHandler<HTMLDivElement>;
  $dark?: boolean;
}) => (
  <Container>
    <Icon
      data-disable-drag
      className="material-icons"
      $dark={$dark}
      onClick={onClick}
    >
      menu
    </Icon>
  </Container>
);

const Container = styled.div``;

const Icon = styled.i<{ $dark?: boolean }>`
  transition: background-color 0.3s;
  font-size: 15px;
  background-color: white;
  border-radius: 5px;
  padding: 4px;
  color: #333;
  cursor: pointer;
  box-shadow: ${theme.shadows[0]};

  &:active:hover {
    background-color: rgb(200, 200, 200);
  }

  ${(p) =>
    p.$dark &&
    css`
      background: ${theme.ui1};
      color: white;
    `};
`;

export default MenuIcon;
