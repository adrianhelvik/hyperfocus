import { withRouter } from 'react-router-dom'
import { autobind } from 'core-decorators'
import { observable, action } from 'mobx'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import Button from 'ui/Button'
import Input from 'ui/Input'
import React from 'react'
import api from 'api'

@withRouter
@observer
class Register extends React.Component {
  @observable repeatedPassword = ''
  @observable password = ''
  @observable email = ''

  @action.bound setEmail(event) {
    this.email = event.target.value
  }

  @action.bound setPassword(event) {
    this.password = event.target.value
  }

  @action.bound setRepeatedPassword(event) {
    this.repeatedPassword = event.target.value
  }

  @autobind async onSubmit(event) {
    event.preventDefault()

    if (this.password !== this.repeatedPassword)
      return alert('The passwords do not match')

    try {
      await api.registerUser({
        password: this.password,
        email: this.email,
      })
      this.props.history.push('/login')
    } catch (e) {
      console.error(e)
      alert(e.message)
    }
  }

  render() {
    return (
      <Container onSubmit={this.onSubmit}>
        <InnerContainer>
          <Input
            placeholder="Email"
            onChange={this.setEmail}
            value={this.email}
          />
          <br />
          <Input
            type="password"
            placeholder="Password"
            onChange={this.setPassword}
            value={this.password}
          />
          <br />
          <Input
            type="password"
            placeholder="Repeat password"
            onChange={this.setRepeatedPassword}
            value={this.repeatedPassword}
          />
          <br />
          <Button type="submit">
            Create user
          </Button>
        </InnerContainer>
      </Container>
    )
  }
}

export default Register

const Container = styled.form`
  min-height: calc(100vh - 64px);
  align-items: flex-start;
  display: flex;
  margin: 0;
`

const InnerContainer = styled.div`
  margin: auto;
`
