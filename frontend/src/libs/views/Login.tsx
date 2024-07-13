import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import * as theme from "src/libs/theme";
import styled, { css } from "styled-components";
import { observer } from "mobx-react";
import Input from "src/libs/ui/Input";
import { Logo } from "../ui/Header";
import sleep from "src/libs/sleep";
import React from "react";
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
              color={theme.logo1}
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
            <Input
              color={theme.logo1}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
            />
            <Button>Log in</Button>
            <Message>
              {message}
              {error && (
                <React.Fragment>
                  <strong>An error occurred</strong>
                  {error}
                </React.Fragment>
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
    background:
      linear-gradient(90deg, rgba(0,0,0,0), ${Color(theme.logo1).alpha(0.1).string()}),
      linear-gradient(black, ${Color(theme.logo1).darken(0.9).hex()});
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
`;

const Message = styled.div`
  color: ${theme.logo1};
  text-align: center;
  margin-top: 30px;
  height: 80px;

  & strong {
    display: block;
  }
`;

const Button = styled.button`
  background-color: white;
  border-radius: 4px;
  padding: 7px 10px;
  color: #333;
  text-align: center;
  cursor: pointer;
  display: block;
  border: none;
  font-size: inherit;
  margin: 0;

  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: ${theme.logo1};
  }

  &:focus {
    background-color: ${theme.logo1};
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${theme.logo1};
    outline-offset: 2px;
  }

  &:hover:active {
    background-color: ${theme.darkPurple};
  }
`;
