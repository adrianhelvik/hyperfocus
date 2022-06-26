import { observer, Provider } from 'mobx-react'
import { observable } from 'mobx'
import Routes from './Routes'
import * as mobx from 'mobx'
import Store from 'store'
import React from 'react'

const components = observable({
  Routes,
})

if (import.meta.hot) {
  import.meta.hot.accept('./Routes.js', module => {
    components.Routes = module.default
  })
  import.meta.hot.accept('store', () => {
    window.location.reload()
  })
}

@observer
class App extends React.Component {
  @observable unhandledRejection = null
  store = new Store()

  componentDidMount() {
    window.addEventListener('unhandledRejection', e => {
      this.unhandledRejection = e
    })
  }

  render() {
    if (this.unhandledRejection)
      return <div>{this.unhandledRejection.stack}</div>
    return <Provider store={this.store} children={<components.Routes />} />
  }
}

export default App
