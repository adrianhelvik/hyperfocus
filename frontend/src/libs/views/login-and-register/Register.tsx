import { Button, Container, Content, Form, LogoWrapper, Message } from "./components";
import api, { setPersistentHeader } from "src/libs/api";
import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { Logo } from "src/libs/ui/Header";
import * as theme from "src/libs/theme";
import Input from "src/libs/ui/Input";

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
