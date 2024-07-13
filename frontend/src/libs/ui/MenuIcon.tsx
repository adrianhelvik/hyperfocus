import { MouseEventHandler } from "react";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import Color from "color";

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
  padding: 7px;
  color: #333;
  cursor: pointer;
  box-shadow: ${theme.shadows[0]};

  &:active:hover {
    background-color: ${Color("white").alpha(0.6).string()};
  }

  background-color: ${Color("white").alpha(0.3).string()};
  color: white;

  &:hover {
    background-color: ${Color("white").alpha(0.4).string()};
  }
`;

export default MenuIcon;
