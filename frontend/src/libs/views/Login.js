import { Redirect } from 'react-router-dom'
import { autobind } from 'core-decorators'
import { withAuth } from '../authContext'
import { observable, action } from 'mobx'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import * as theme from 'theme'
import Input from 'ui/Input'
import React from 'react'

@withAuth
@observer
class Login extends React.Component {
  @observable username = ''
  @observable password = ''

  @action.bound setPassword(event) {
    this.password = event.target.value
  }

  @action.bound setUsername(event) {
    this.username = event.target.value
  }

  @autobind async onSubmit(event) {
    event.preventDefault()

    await this.props.auth.login({
      username: this.username,
      password: this.password,
    })
  }

  async componentDidMount() {
    await this.props.auth.authenticate()
  }

  render() {
    if (this.props.auth.status === 'success')
      return (
        <Redirect to="/app" />
      )

    return (
      <Container>
        <Form onSubmit={this.onSubmit}>
          <InputWrapper>
            <Input
              placeholder="Username"
              onChange={this.setUsername}
              value={this.username}
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              placeholder="Password"
              onChange={this.setPassword}
              value={this.password}
              type="password"
            />
          </InputWrapper>
          <Button>Log in</Button>
        </Form>
      </Container>
    )
  }
}

export default Login

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
`

const InputWrapper = styled.div`
  margin-top: 25px;
`

const Button = styled.button`
  background-color: ${theme.ui1};
  border-radius: 4px;
  padding: 7px 10px;
  color: white;
  text-align: center;
  margin-top: 30px;
  cursor: pointer;
  display: block;
  border: none;
  font-size: inherit;
  margin-left: auto;
  margin-right: auto;
`
