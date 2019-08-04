import { action, observable, computed, runInAction } from 'mobx'
import styled, { css } from 'styled-components'
import someParent from 'util/someParent'
import withEvents from 'util/withEvents'
import { elementToDeck } from './Deck'
import { Portal } from 'react-portal'
import { observer } from 'mobx-react'
import withConfirm from 'withConfirm'
import * as zIndexes from 'zIndexes'
import * as theme from 'theme'
import React from 'react'
import api from 'api'

export const elementToCard = observable.map()

@withConfirm
@withEvents
@observer
class Card extends React.Component {
  @observable initialClientX = null
  @observable initialClientY = null
  @observable noPointer = false
  @observable clientX = null
  @observable clientY = null
  @observable moving = false
  @observable insetX = null
  @observable insetY = null

  componentDidMount() {
    elementToCard.set(this.element, this)
  }

  componentWillUnmount() {
    elementToCard.delete(this.element)
  }

  @action.bound onMouseDown(event) {
    event.stopPropagation()
    const { target, clientX, clientY } = event

    if (target === this.removeElement)
      return this.remove(event)

    // extract values
    const rect = this.element.getBoundingClientRect()
    this.initialClientX = this.clientX = clientX
    this.initialClientY = this.clientY = clientY
    this.insetX = rect.left - this.initialClientX
    this.insetY = rect.top - this.initialClientY
    this.width = this.element.offsetWidth
    this.height = this.element.offsetHeight

    // start moving
    this.moving = true
    this.props.setMoving(true)
    this.props.setHoverIndex(this.props.index)

    this.props.on(document, 'mousemove', (event) => {
      this.clientX = event.clientX
      this.clientY = event.clientY
    })

    this.props.on(document, 'mouseup', (event) => {
      this.moving = false
      this.props.setMoving(false)
      const { clientX, clientY } = event
      const target = document.elementFromPoint(clientX, clientY)
      this.noPointer = false

      this.props.setHoverIndex(null)
      const element = someParent(target, e => {
        return elementToDeck.has(e)
      })
      const otherDeckComponent = elementToDeck.get(element)

      if (otherDeckComponent) {
        const otherDeck = otherDeckComponent.props.deck
        const index = this.props.getLastHoverIndex()
        const card = this.props.card

        api.moveCard({
          cardId: card.cardId,
          source: this.props.deck.deckId,
          target: otherDeck.deckId,
          index,
        })

        runInAction(() => {
          this.props.deck.removeCard(this.props.card)
          otherDeck.addCard(this.props.card, index)
        })
      }

      this.props.off(document, 'mousemove')
      this.props.off(document, 'mouseup')
      this.clientX
        = this.clientY
        = this.initialClientX
        = this.initialClientY
        = 0
    })
  }

  @computed get style() {
    if (this.moving) return {
      top: this.clientY,
      left: this.clientX,
      width: this.width,
      height: this.height,
      transform: `translateX(${this.insetX}px) translateY(${this.insetY}px)`,
    }
    return {}
  }

  @computed get deltaX() {
    return this.clientX - this.initialClientX
  }

  @computed get deltaY() {
    return this.clientY - this.initialClientY
  }

  remove = async event => {
    if (! await this.props.confirmInPlace(event, p =>
      <div>
        <div>
          Delete card?
        </div>
        <button onClick={p.yes}>Yes</button>
        <button onClick={p.no}>No</button>
      </div>
    )) return
    this.props.deck.removeCard(this.props.card)
    await api.deleteCard({
      cardId: this.props.card.cardId
    })
  }

  template() {
    return (
      <Container
        data-card={this.props.index}
        innerRef={e => this.element = e}
        className={this.props.className}
        onMouseDown={this.onMouseDown}
        noPointer={this.noPointer}
        index={this.props.index}
        moving={this.moving}
        style={this.style}
      >
        {Boolean(this.moving) &&
            <style>{`body { user-select: none }`}</style>
        }
        <Title>
          {this.props.card.title}
        </Title>
        <Remove innerRef={e => this.removeElement = e}>-</Remove>
      </Container>
    )
  }

  placeholder() {
    if (! this.props.moving)
      return null

    return (
      <div
        data-card-placeholder={this.props.index}
        style={{
          width: this.props.placeholderWidth,
          height: this.props.placeholderHeight,
        }}
      />
    )
  }

  render() {
    const Wrapper = this.moving
      ? Portal
      : React.Fragment

    return (
      <React.Fragment>
        {this.props.hoverIndex === this.props.index &&
            this.placeholder()
        }
        <Wrapper>{this.template()}</Wrapper>
      </React.Fragment>
    )
  }
}

export default Card

const Container = styled.div`
  display: flex;
  background: white;
  position: ${p => p.moving ? 'fixed' : 'relative'};
  transition: box-shadow .3s;
  z-index: ${p => p.moving ? zIndexes.moving : zIndexes.movable};
  ${p => p.moving && css`pointer-events: none`};
  ${p => p.moving && css`box-shadow: ${theme.shadows[1]}`};
  cursor: move;
  ::after {
    content: ${p => String(p.index)};
  }
`

const Title = styled.div`
  white-space: pre-line;
  flex-grow: 1;
`

const Remove = styled.div`
  background: #aaa;
  width: 20px;
  text-align: center;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: flex-start;
`
