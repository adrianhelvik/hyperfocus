import hoist from 'hoist-non-react-statics'
import React from 'react'

export default WrappedComponent => {
  class NewComponent extends React.Component {
    static displayName = WrappedComponent.displayName || WrappedComponent.name
    static WrappedComponent =
      WrappedComponent.WrappedComponent || WrappedComponent
    listeners = []

    on = (target, eventName, realHandler) => {
      const handler = event => realHandler(event) // Prevents Babel bug
      if (this.unmounted) {
        console.error(
          'Attempted to add event listener after unmounting. This is a noop',
        )
        return
      }
      this.listeners.push({ target, eventName, handler })
      target.addEventListener(eventName, handler)
    }

    off = (target, eventName) => {
      const listeners = []
      const toRemove = []

      for (const listener of this.listeners) {
        if (listener.target === target && listener.eventName === eventName)
          toRemove.push(listener)
        else listeners.push(listener)
      }

      for (const { target, eventName, handler } of toRemove)
        target.removeEventListener(eventName, handler)

      this.listeners = listeners
    }

    componentWillUnmount() {
      this.unmounted = true
      for (const { target, eventName, handler } of this.listeners)
        target.removeEventListener(eventName, handler)
    }

    render() {
      return <WrappedComponent {...this.props} on={this.on} off={this.off} />
    }
  }

  hoist(NewComponent, WrappedComponent)

  return NewComponent
}
