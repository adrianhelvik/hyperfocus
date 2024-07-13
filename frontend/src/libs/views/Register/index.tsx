import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import * as theme from "src/libs/theme";
import styled, { css } from "styled-components";
import Input from "src/libs/ui/Input";
import api, { setPersistentHeader } from "src/libs/api";
import { Logo } from "src/libs/ui/Header";
import Color from "color";

export default function Register() {
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("Logging in...");

    if (password !== repeatedPassword) {
      setError("The passwords do not match");
      setMessage("");
      return;
    }

    try {
      const { sessionId } = await api.registerUser({
        password,
        email,
      })
      setPersistentHeader("Authorization", `Bearer ${sessionId}`);
      navigate("/login");
    } catch (e: any) {
      setError(e.message);
      setMessage("");
    }
  };

  return (
    <Container>
      <Content>
        <LogoWrapper>
          <Logo pageColor="#333" />
        </LogoWrapper>
        <Form onSubmit={onSubmit}>
          <Input
            color={theme.brightBlue}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            size={25}
            value={email}
          />
          <Input
            color={theme.brightBlue}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            size={25}
            value={password}
          />
          <Input
            color={theme.brightBlue}
            type="password"
            placeholder="Repeat password"
            onChange={(e) => setRepeatedPassword(e.target.value)}
            size={25}
            value={repeatedPassword}
          />
          <Button type="submit">Register</Button>
          <Button type="button" onClick={() => navigate("/login")} $secondary>Log in</Button>
          <Message>
            {message}
            {error && (
              <>
                {error}
              </>
            )}
          </Message>
        </Form>
      </Content>
    </Container>
  );
}

const Container = styled.div`
    background: ${theme.smoothGradient};
    color: white;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Content = styled.div`
  
`;


const Form = styled.form`
  margin: auto;
  padding-bottom: 100px;
  display: grid;
  grid-auto-flow: row;
  gap: 25px;
  max-width: calc(100vw - 60px);
`;

const LogoWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 50px;
`;

const Message = styled.div`
  color: ${theme.brightBlue};
  text-align: center;
  margin-top: 30px;
  letter-spacing: 1px;
  height: 40px;

  & strong {
    display: block;
  }
`;

const Button = styled.button<{ $secondary?: boolean }>`
  background-color: ${theme.brightBlue};
  border-radius: 4px;
  padding: 10px 10px;
  font-weight: bold;
  color: ${Color(theme.brightBlue).mix(Color("black"), 0.8).hex()};
  text-align: center;
  cursor: pointer;
  display: block;
  border: none;
  font-size: inherit;
  margin: 0;

  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: ${theme.brightBlue};
  }

  &:focus {
    background-color: ${theme.brightBlue};
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${theme.brightBlue};
    outline-offset: 2px;
  }

  &:hover:active {
    background-color: ${theme.darkPurple};
  }

  ${p => p.$secondary && css`
    background-color: ${Color(theme.brightBlue).mix(Color("#000"), 0.6).hex()};
    color: ${Color(theme.brightBlue).mix(Color("white"), 0.2).mix(Color("black"), 0.2).hex()};
    font-weight: normal;

    &:focus {
      background-color: ${Color(theme.brightBlue).mix(Color("#000"), 0.6).hex()};
    }
  `}
`;
