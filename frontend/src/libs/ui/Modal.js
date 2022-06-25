import styled, { css } from 'styled-components'
import Backdrop from './Backdrop'
import * as theme from 'theme'
import assert from 'assert'
import React from 'react'

class Modal extends React.Component {
  render() {
    if (this.props.placement) {
      assert.equal(typeof this.props.placement.x, 'number')
      assert.equal(typeof this.props.placement.y, 'number')
    }

    if (typeof this.props.hide !== 'function')
      throw Error('this.props.hide must be a function')

    return (
      <Backdrop
        is="dialog"
        transparent={Boolean(this.props.placement)}
        hide={this.props.hide}
      >
        <Container placement={this.props.placement}>
          {this.props.children}
        </Container>
      </Backdrop>
    )
  }
}

export default Modal

const Container = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 400px;
  ${p =>
    !p.placement &&
    css`
      margin-bottom: 100px;
    `}

  ${p =>
    p.placement &&
    css`
      position: fixed;
      left: ${p.placement.x}px;
      top: ${p.placement.y + 20}px;
      transform: translateX(-50%);
      box-shadow: ${theme.shadows[1]};
    `}
`
