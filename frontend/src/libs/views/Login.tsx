import { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { useAuth } from '../authContext'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import * as theme from 'theme'
import Button from 'ui/Button'
import Input from 'ui/Input'
import React from 'react'
import sleep from 'sleep'

export default observer(function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const auth = useAuth()

  const onSubmit = async event => {
    event.preventDefault()
    setError('')
    setMessage('Logging in...')

    await sleep(500)

    await auth
      .login({
        username,
        password,
      })
      .catch(e => {
        setError(e.message)
        setMessage('')
      })
  }

  useEffect(() => {
    auth.authenticate()
  }, [])

  console.log('auth:', auth)

  if (auth.status === 'success') return <Redirect to="/app" />

  return (
    <Container>
      <Form onSubmit={onSubmit}>
        <Input
          placeholder="Username"
          onChange={e => setUsername(e.target.value)}
          value={username}
        />
        <Input
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
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
  )
})

const Container = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
  display: flex;
`

const Form = styled.form`
  margin: auto;
  padding-bottom: 100px;
  display: grid;
  grid-auto-flow: row;
  gap: 20px;
`

const Message = styled.div`
  color: ${theme.ui1};
  text-align: center;
  margin-top: 30px;
  height: 80px;

  & strong {
    display: block;
  }
`
