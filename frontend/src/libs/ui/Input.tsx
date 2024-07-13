import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  ChangeEventHandler,
} from "react";
import styled, { css } from "styled-components";
import * as theme from "../theme";
import Color from "color";

type Props = {
  onChange: ChangeEventHandler<HTMLInputElement>;
  type?: string;
  autoFocus?: boolean;
  innerRef?: (element: HTMLInputElement) => void;
  value: string;
  placeholder?: string;
  size?: number;
  color?: string;
};

export default function Input(props: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [element, setElement] = useState<HTMLInputElement>();
  const color = props.color ?? theme.ui1;

  const type = useMemo(() => {
    if (showPassword) return "text";
    return props.type;
  }, [showPassword, props.type]);

  useEffect(() => {
    if (!props.autoFocus) return;
    if (!element) return;
    element.focus();
  }, [props.autoFocus, element]);

  useEffect(() => {
    if (!showPassword) return;
    const onMouseUp = () => {
      setShowPassword(false);
    };
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [showPassword]);

  const _innerRef = props.innerRef;
  const innerRef = useCallback(
    (element: HTMLInputElement) => {
      if (typeof _innerRef === "function") {
        _innerRef(element);
      }
      setElement(element);
    },
    [_innerRef]
  );

  const show = useCallback(() => {
    setShowPassword(true);
  }, []);

  return (
    <Container>
      <Label>
        <InputField
          $color={color}
          onChange={props.onChange}
          value={props.value}
          size={props.size}
          ref={innerRef}
          type={showPassword ? "text" : type}
          $forPassword={props.type === "password"}
          $colored={showPassword}
        />
        <LabelText $hasContent={Boolean(props.value)} $color={color}>
          {props.placeholder}
        </LabelText>
      </Label>
      {props.type === "password" && (
        <Icon
          $color={color}
          $colored={showPassword}
          className="material-icons"
          onMouseDown={show}
        >
          remove_red_eye
        </Icon>
      )}
    </Container>
  );
}

const padding = "7px 5px";
const fontSize = "1.1rem";

const Container = styled.div`
  position: relative;
`;

const InputField = styled.input<{ $forPassword: boolean; $colored: boolean, $color: string }>`
  font-size: ${fontSize};
  padding: ${padding};
  border: 1px solid ${theme.gray1};
  box-sizing: border-box;
  border-radius: 4px;
  width: 100%;
  &:focus {
    outline: none;
    border-color: ${p => p.$color || theme.ui1};
  }
  &:focus + * {
    transform: translateY(calc(-100% - 7px)) scale(0.7) translateX(-5px);
    color: ${p => p.$color || theme.ui1};
  }
  ${(p) =>
    p.$forPassword &&
    css`
      padding-right: 30px;
    `}
  ${(p) =>
    p.$colored &&
    css`
      border-color: ${p.$color || theme.ui1};
    `}
`;

const LabelText = styled.div<{ $hasContent: boolean, $color: string }>`
  position: absolute;
  font-size: ${fontSize};
  padding: ${padding};
  pointer-events: none;
  color: ${p => Color(p.$color).mix(Color("#999"), 0.7).hex()};
  top: 50%;
  left: 3px;
  transform: translateY(-50%);
  transform-origin: 0 0;
  transition: 0.3s;
  font-weight: 300;
  ${(props) =>
    props.$hasContent &&
    css`
      transform: translateY(calc(-100% - 7px)) scale(0.7) translateX(-5px);
    `}
  &:-webkit-autofill + & {
    transform: translateY(calc(-100% - 7px)) scale(0.7) translateX(-5px);
  }
`;

const Label = styled.label``;

const Icon = styled.i<{ $colored: boolean, $color: string }>`
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  ${(p) =>
    p.$colored &&
    css`
      color: ${p.$color || theme.ui1};
    `}
`;
