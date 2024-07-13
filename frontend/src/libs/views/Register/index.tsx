import { useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import Input from "src/libs/ui/Input";
import api from "src/libs/api";
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

    if (password !== repeatedPassword)
      return alert("The passwords do not match");

    try {
      await api.registerUser({
        password,
        email,
      })
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
            size={20}
            value={email}
          />
          <Input
            color={theme.brightBlue}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            size={20}
            value={password}
          />
          <Input
            color={theme.brightBlue}
            type="password"
            placeholder="Repeat password"
            onChange={(e) => setRepeatedPassword(e.target.value)}
            size={20}
            value={repeatedPassword}
          />
          <Button type="submit">Create user</Button>
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

const Button = styled.button`
  background-color: white;
  font-weight: bold;
  border-radius: 4px;
  padding: 7px 10px;
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
  height: 80px;

  & strong {
    display: block;
  }
`;

