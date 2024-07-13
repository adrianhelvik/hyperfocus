import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import * as theme from "src/libs/theme";
import Button from "src/libs/ui/Button";
import styled from "styled-components";
import { observer } from "mobx-react";
import Input from "src/libs/ui/Input";
import sleep from "src/libs/sleep";
import React from "react";

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
    <Container>
      <Form onSubmit={onSubmit}>
        <Input
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <Input
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
    </Container>
  );
});

const Container = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
  display: flex;
`;

const Form = styled.form`
  margin: auto;
  padding-bottom: 100px;
  display: grid;
  grid-auto-flow: row;
  gap: 20px;
`;

const Message = styled.div`
  color: ${theme.ui1};
  text-align: center;
  margin-top: 30px;
  height: 80px;

  & strong {
    display: block;
  }
`;
