import styled, { css } from 'styled-components'
import withEvents from '../util/withEvents'
import * as zIndexes from '../zIndexes'
import { observer } from 'mobx-react'
import fade from './fade'
import React from 'react'

@withEvents
@fade({
  close: 'hide',
})
@observer
class Backdrop extends React.Component {
  componentDidMount() {
    this.props.on(document, 'keydown', event => {
      if (event.which === 27) this.props.hide(event)
    })
  }

  hide = event => {
    if (
      event.target === this.container &&
      typeof this.props.hide === 'function'
    )
      this.props.hide(event)
  }

  render() {
    return (
      <OuterContainer
        transparent={this.props.transparent}
        onClick={this.hide}
        ref={e => (this.container = e)}
      >
        <InnerContainer>{this.props.children}</InnerContainer>
      </OuterContainer>
    )
  }
}

export default Backdrop

const OuterContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
  z-index: ${zIndexes.backdrop};

  align-items: flex-start;
  display: flex;

  background-color: rgba(0, 0, 0, 0.5);

  ${p =>
    p.transparent &&
    css`
      background-color: rgba(0, 0, 0, 0.0001);
    `}
`

const InnerContainer = styled.div`
  margin: auto;
`
