import { mixBlackWhite } from "src/libs/colorFns";
import styled, { css } from "styled-components";
import onSelect from "src/libs/util/onSelect";
import { ReactNode } from "react";

type Props = {
  color: string;
  children: ReactNode;
  value: boolean;
  onToggle: () => void;
};

export function Toggle(props: Props) {
  return (
    <Container>
      <Text $color={props.color}>{props.children}</Text>
      <Background {...onSelect(props.onToggle)} $active={props.value} $color={props.color}>
        <Dot $active={props.value}>
        </Dot>
      </Background>
    </Container>
  )
}

const Background = styled.div<{ $active: boolean, $color: string }>`
  --padding: 2px;
  --dot-width: 20px;
  --dot-height: 20px;
  --height: calc(var(--dot-height) + var(--padding) * 2);
  --width: 50px;

  display: block;
  padding: 0;
  margin: 0;
  font-size: inherit;
  appearance: none;
  border: none;

  width: var(--width);
  height: var(--height);
  padding: var(--padding);

  transition: background-color 300ms;
  background-color: ${p => p.$active ? p.$color : mixBlackWhite(p.$color, 0.6, 0.6)};
  border-radius: calc(var(--height) / 2);

  cursor: pointer;

  &:hover {
      outline: 1px solid ${p => mixBlackWhite(p.$color, 0.6, 0.6, 0.5)};
      outline-offset: 2px;
  }

  &:focus {
      outline: 1px solid ${p => mixBlackWhite(p.$color, 0.6, 0.6)};
      outline-offset: 2px;
  }
`

const Dot = styled.div<{ $active: boolean }>`
  background-color: white;
  width: var(--dot-width);
  height: var(--dot-height);
  border-radius: calc(min(var(--dot-width), var(--dot-height)) / 2);
  transition: margin 100ms;

  ${p => p.$active && css`
      margin-left: calc(var(--width) - var(--dot-width) - var(--padding) * 2);
  `}
`;

const Text = styled.span<{ $color: string }>`
  color: ${p => mixBlackWhite(p.$color, 0.2, 0.6)};
`

const Container = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;
