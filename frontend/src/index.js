import registerServiceWorker from './registerServiceWorker'
import ReactDOM from 'react-dom'
import React from 'react'
import './index.css'
import './debug'

const render = () => {
  const App = require('./App').default
  ReactDOM.render(<App rerender={render} />, document.getElementById('root'))
}

render()
registerServiceWorker()

if (module.hot) {
  module.hot.accept('./App', () => {
    console.log('-- force updating app --')
    render()
  })
}
