import hoist from 'hoist-non-react-statics'
import { observable, action } from 'mobx'
import styled from 'styled-components'
import { Portal } from 'react-portal'
import { observer } from 'mobx-react'
import Modal from 'ui/Modal'
import React from 'react'

export default Component => {

  @observer
  class WithConfirm extends React.Component {
    @observable placement = null
    @observable Template = null
    @observable promise = null
    @observable resolve = null
    @observable reject = null

    @action.bound confirm(Template) {
      this.Template = Template
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
      return this.promise
    }

    @action.bound confirmInPlace(event, Template) {
      if (typeof event.clientX !== 'number')
        throw Error('event.clientX was not a number')
      if (typeof event.clientY !== 'number')
        throw Error('event.clientY was not a number')
      this.confirm(Template)
      this.placement = {
        x: event.clientX,
        y: event.clientY,
      }
      return this.promise
    }

    @action.bound yes() {
      this.resolve(true)
      this.Template = null
      this.placement = null
    }

    @action.bound no() {
      this.resolve(false)
      this.Template = null
      this.placement = null
    }

    render() {
      return (
        <React.Fragment>
          <Component
            {...this.props}
            confirm={this.confirm}
            confirmInPlace={this.confirmInPlace}
          />
          {this.Template &&
              <Portal>
                <Backdrop hide={this.no}>
                  <Modal placement={this.placement} hide={this.no}>
                    <this.Template yes={this.yes} no={this.no} />
                  </Modal>
                </Backdrop>
              </Portal>
          }
        </React.Fragment>
      )
    }
  }

  hoist(WithConfirm, Component)

  return WithConfirm
}

const Backdrop = styled.div`
  background-color: rgba(0, 0, 0, .3);
  position: fixed;
  z-index: 10;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
  overflow: auto;
  display: flex;
  align-items: flex-start;
`
