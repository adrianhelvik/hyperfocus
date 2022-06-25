import { withRouter } from 'react-router-dom'
import * as zIndexes from '../zIndexes'
import { Link } from 'react-router-dom'
import { withAuth } from 'authContext'
import styled from 'styled-components'
import * as theme from '../theme'
import React from 'react'

@withRouter
@withAuth
class Header extends React.Component {
  render() {
    const isInApp = /^\/(app|board)($|\/)/.test(this.props.match.path)

    return (
      <Container>
        <UndecoratedLink to={isInApp ? '/app' : '/'}>
          <Logo />
        </UndecoratedLink>
        <div>{this.props.children}</div>
        {this.props.auth.status === 'success' ? (
          this.props.location.pathname === '/' ? (
            <Login to="/login">Go to dashboard</Login>
          ) : (
            <Logout onClick={this.props.auth.logout}>Log out</Logout>
          )
        ) : (
          <Login to="/login">Log in</Login>
        )}
      </Container>
    )
  }
}

export default Header

const UndecoratedLink = styled(Link)`
  text-decoration: none;
`

const Container = styled.div`
  background-color: ${theme.ui1};
  position: sticky;
  top: 0;
  padding: 15px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  z-index: ${zIndexes.header};
  a,
  button {
    color: white;
    font-size: 14px;
  }
`

const Logo = () => (
  <Logo.Container>
    <Logo.Text1>
      sub
      <UnderLine />
    </Logo.Text1>
    <Logo.Text2>task</Logo.Text2>
  </Logo.Container>
)

Logo.Container = styled.div`
  color: white;
  font-size: 25px;
  text-transform: uppercase;
  letter-spacing: 4px;
  font-weight: bold;
`

Logo.Text1 = styled.span`
  color: ${theme.logo1};
  position: relative;
`

Logo.Text2 = styled.span`
  color: ${theme.logo2};
`

const UnderLine = styled.div`
  height: 4px;
  background-color: ${theme.logo1};
  width: 61px;
  position: absolute;
  top: 100%;
  left: 0;
`

const Login = styled(Link)`
  color: white;
`

const Logout = styled.button`
  color: white;
  text-decoration: underline;
  background-color: transparent;
  border: 0;
  cursor: pointer;
`
