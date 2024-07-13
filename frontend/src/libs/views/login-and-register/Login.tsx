import { Button, Container, Content, Form, Heading, LogoWrapper, Message } from "./components";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { Logo } from "src/libs/ui/Header";
import * as theme from "src/libs/theme";
import { observer } from "mobx-react";
import Input from "src/libs/ui/Input";
import sleep from "src/libs/sleep";

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
            <Heading>Welcome back!</Heading>
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
