import api, { setPersistentHeader } from 'api'
import hoist from 'hoist-non-react-statics'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'

const authContext = React.createContext()

export default authContext

export function withAuth(WrappedComponent) {
  const name =
    WrappedComponent.displayName || WrappedComponent.name || '<component>'

  const WithAuth = props => {
    const auth = React.useContext(authContext)

    return <WrappedComponent {...props} auth={auth} />
  }

  WithAuth.displayName = `withContext(${name})`

  hoist(WithAuth, WrappedComponent)

  return WithAuth
}

@observer
class ProvideAuth extends React.Component {
  @observable status = 'pending'

  async login(payload) {
    this.status = 'pending'
    const { sessionId } = await api.login(payload)
    setPersistentHeader('Authorization', `Bearer ${sessionId}`)
    await this.authenticate()
  }

  async authenticate() {
    try {
      await api.authenticate()
      console.log(
        '%cauthentication successful',
        'background:lightgreen;padding:4px',
      )
      this.status = 'success'
      return true
    } catch (e) {
      console.log('%cauthentication failed', 'background:red;padding:4px')
      this.status = 'failure'
      return false
    }
  }

  async logout() {
    await api.logout()
    window.location.href = '/'
  }

  @computed get value() {
    return {
      authenticate: this.authenticate.bind(this),
      logout: this.logout.bind(this),
      login: this.login.bind(this),
      status: this.status,
    }
  }

  render() {
    if (!this.value.login) throw Error('Failure')

    return (
      <authContext.Provider value={this.value}>
        {this.props.children}
      </authContext.Provider>
    )
  }
}

export { ProvideAuth }
