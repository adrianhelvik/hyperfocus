import { observable, computed, action } from 'mobx'
import api, { setPersistentHeader } from 'api'
import hoist from 'hoist-non-react-statics'
import { observer } from 'mobx-react'
import React, { useContext } from 'react'

const AuthContext = React.createContext(null)

export function withAuth(WrappedComponent: React.Component | React.FC) {
  const name =
    WrappedComponent.displayName || WrappedComponent.name || '<component>'

  const WithAuth = props => {
    const auth = React.useContext(AuthContext)

    return <WrappedComponent {...props} auth={auth} />
  }

  WithAuth.displayName = `withContext(${name})`

  hoist(WithAuth, WrappedComponent)

  return WithAuth
}

export function useAuth() {
  return useContext(AuthContext)
}

@observer
class ProvideAuth extends React.Component {
  @observable status = 'pending'

  @action setStatus(status) {
    this.status = status
  }

  async login(payload) {
    this.setStatus('pending')
    const { sessionId } = await api.login(payload)
    setPersistentHeader('Authorization', `Bearer ${sessionId}`)
    await this.authenticate()
  }

  async authenticate() {
    try {
      await api.authenticate()
      this.setStatus('success')
      return true
    } catch (e) {
      console.log('%cauthentication failed', 'background:red;padding:4px')
      this.setStatus('failure')
      return false
    }
  }

  async logout() {
    await api.logout()
    window.location.href = '/'
  }

  @computed get auth() {
    return {
      authenticate: this.authenticate.bind(this),
      logout: this.logout.bind(this),
      login: this.login.bind(this),
      status: this.status,
    }
  }

  render() {
    if (!this.auth.login) throw Error('Failure')

    return (
      <AuthContext.Provider value={this.auth}>
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

export { ProvideAuth }
