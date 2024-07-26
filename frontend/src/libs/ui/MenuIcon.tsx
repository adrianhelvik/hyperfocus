import { MouseEventHandler } from "react";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import Color from "color";
import { resetButton } from "src/styles/helpers";

const MenuIcon = ({
  onClick,
  $dark,
}: {
  onClick: MouseEventHandler<HTMLElement>;
  $dark?: boolean;
}) => (
  <Container onClick={onClick}>
    <Icon
      data-disable-drag
      className="material-icons"
      $dark={$dark}
    >
      menu
    </Icon>
  </Container>
);

const Container = styled.button`
  ${resetButton};
`;

const shadeBy = (amount: number) => (p: { $dark?: boolean }) => {
  return Color(p.$dark ? "white" : "black").alpha(amount).string();
}

const Icon = styled.i<{ $dark?: boolean }>`
  transition: background-color 0.3s;
  font-size: 15px;
  background-color: white;
  border-radius: 5px;
  padding: 7px;
  color: #333;
  cursor: pointer;
  box-shadow: ${theme.shadows[0]};

  &:active:hover {
    background-color: ${shadeBy(0.6)};
  }

  background-color: ${shadeBy(0.3)};
  color: white;

  &:hover {
    background-color: ${shadeBy(0.4)};
  }
`;

export default MenuIcon;
