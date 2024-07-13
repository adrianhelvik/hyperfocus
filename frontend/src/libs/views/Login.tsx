import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import * as theme from "src/libs/theme";
import styled, { css } from "styled-components";
import { observer } from "mobx-react";
import Input from "src/libs/ui/Input";
import { Logo } from "../ui/Header";
import sleep from "src/libs/sleep";
import Color from "color";

export default observer(function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("Logging in...");

    await sleep(500);

    await auth
      .login({
        username,
        password,
      })
      .catch((e) => {
        setError(e.message);
        setMessage("");
      });
  };

  useEffect(() => {
    auth.authenticate();
  }, [auth]);

  useEffect(() => {
    if (auth.status === "success") {
      navigate("/app");
    }
  }, [auth.status]);

  return (
    <>
      <Container>
        <Content>
          <LogoWrapper>
            <Logo pageColor="#333" />
          </LogoWrapper>
          <Form onSubmit={onSubmit}>
            <Input
              size={25}
              color={theme.brightBlue}
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
            <Input
              size={25}
              color={theme.brightBlue}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
            />
            <Button>Log in</Button>
            <Button type="button" onClick={() => navigate("/register")} $secondary>Register</Button>
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
    </>
  );
});

const LogoWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 50px;
`;

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
  padding: 7px 10px;
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
