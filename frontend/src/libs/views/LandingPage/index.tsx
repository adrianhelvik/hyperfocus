import { withAuth } from 'authContext'
import Header from 'ui/Header'
import React from 'react'

import {
  LoginWrapper,
  Particles,
  Register,
  Content,
  Section,
  Login,
  Title,
} from './components'

@withAuth
class LandingPage extends React.Component {
  particles = React.createRef()

  componentDidMount() {
    if (window.particlesJS) {
      window.particlesJS.load('particles-js', 'particles.json', function () {
        console.log('callback - particles.js config loaded')
      })
    }

    this.props.auth.authenticate()
  }

  render() {
    return (
      <React.Fragment>
        <Particles id="particles-js" />
        <Header />
        <Section>
          <Content>
            <Title>
              <strong>Open source</strong> kanban boards with{' '}
              <strong>portals</strong>
            </Title>
            <Register to="/register">Register</Register>
            <LoginWrapper>
              Or <Login to="/login">log in</Login>
            </LoginWrapper>
            <LoginWrapper>
              Or check out on{' '}
              <a
                href="https://github.com/adrianhelvik/subtask"
                style={{ pointerEvents: 'auto' }}
              >
                GitHub
              </a>
            </LoginWrapper>
          </Content>
        </Section>
      </React.Fragment>
    )
  }
}

export default LandingPage