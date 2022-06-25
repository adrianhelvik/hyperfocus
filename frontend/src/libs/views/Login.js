import { Redirect } from 'react-router-dom'
import { autobind } from 'core-decorators'
import { withAuth } from '../authContext'
import { observable, action } from 'mobx'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import * as theme from 'theme'
import Button from 'ui/Button'
import Input from 'ui/Input'
import React from 'react'
import sleep from 'sleep'

@withAuth
@observer
class Login extends React.Component {
  @observable username = ''
  @observable password = ''
  @observable message = ''
  @observable error = ''

  @action.bound setPassword(event) {
    this.password = event.target.value
  }

  @action.bound setUsername(event) {
    this.username = event.target.value
  }

  @autobind async onSubmit(event) {
    event.preventDefault()
    this.error = ''
    this.message = 'Logging in...'

    await sleep(500)

    await this.props.auth
      .login({
        username: this.username,
        password: this.password,
      })
      .catch(e => {
        this.error = e.message
        this.message = ''
      })
  }

  async componentDidMount() {
    await this.props.auth.authenticate()
  }

  render() {
    if (this.props.auth.status === 'success') return <Redirect to="/app" />

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
          <Message>
            {this.message}
            {this.error && (
              <React.Fragment>
                <strong>An error occurred</strong>
                {this.error}
              </React.Fragment>
            )}
          </Message>
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

const Message = styled.div`
  color: ${theme.ui1};
  text-align: center;
  margin-top: 30px;
  height: 80px;

  & strong {
    display: block;
  }
`
