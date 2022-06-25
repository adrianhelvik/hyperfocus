import requestAnimationFrameAsync from 'util/requestAnimationFrameAsync'
import { CirclePicker as ColorPicker } from 'react-color'
import AbstractTextArea from 'react-textarea-autosize'
import styled, { css } from 'styled-components'
import { observable, computed } from 'mobx'
import AddCardInput from './AddCardInput'
import withEvents from 'util/withEvents'
import someParent from 'util/someParent'
import { observer } from 'mobx-react'
import * as zIndexes from 'zIndexes'
import MenuIcon from 'ui/MenuIcon'
import withModal from 'withModal'
import withMenu from 'withMenu'
import sleep from 'util/sleep'
import * as theme from 'theme'
import Color from 'color'
import Card from './Card'
import React from 'react'
import api from 'api'

export const elementToDeck = observable.map()
const decks = observable.map()

const sharedState = new (class {
  @observable moving = []
  @observable lastHoverIndex = null
})()

@withModal
@withMenu
@withEvents
@observer
class Deck extends React.Component {
  @observable lastHoverIndex = null
  @observable cardWith = null
  @observable cardHeight = null
  @observable hoverIndex = null
  @observable hide = false
  @observable justPlaced = false
  @observable movingChild = false
  @observable moving = false
  @observable x = null
  @observable y = null
  @observable initialX = null
  @observable initialY = null
  @observable insetX = null
  @observable insetY = null

  componentDidMount() {
    if (this.props.deck.initialFocus) {
      this.input.focus()
      this.props.deck.initialFocus = false
    }
    decks.set(this, this.props.index)
    elementToDeck.set(this.element, this)
  }

  componentWillUnmount() {
    decks.delete(this)
    elementToDeck.delete(this.element)
  }

  @computed get deltaX() {
    if (!this.moving) return null
    return this.x - this.initialX - this.insetX
  }

  @computed get deltaY() {
    if (!this.moving) return 0
    return this.y - this.initialY - this.insetY
  }

  onMouseDown = event => {
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'BUTTON' ||
      event.target.dataset.disableDrag ||
      event.button === 2
    )
      return

    document.body.classList.add('moving-deck')

    this.calcInitialRects()

    const { clientX, clientY } = event
    this.x = clientX
    this.y = clientY
    const rect = event.target.getBoundingClientRect()
    this.initialX = rect.left
    this.initialY = rect.top
    this.insetX = clientX - rect.left
    this.insetY = clientY - rect.top
    this.moving = true

    this.props.on(document, 'mousemove', event => {
      const { clientX, clientY } = event
      this.x = clientX
      this.y = clientY

      const index = this.getNextIndex()
      this.props.simulateMove(this.props.index, index)
    })

    this.props.on(document, 'mouseup', async event => {
      this.props.off(document, 'mousemove')
      this.props.off(document, 'mouseup')
      document.body.classList.remove('moving-deck')
      const nextIndex = this.getNextIndex()

      if (this.props.index === nextIndex) {
        this.props.simulateMove(null, null)
        this.justPlaced = false
        this.moving = false
        return
      }

      await sleep(0)

      for (const [deck] of decks) deck.justPlaced = true

      await requestAnimationFrameAsync()
      this.props.simulateMove(null, null)
      this.props.move(this.props.index, nextIndex)
      this.hide = true
      this.moving = false
      await requestAnimationFrameAsync()
      for (const [deck] of decks) deck.justPlaced = false
      await requestAnimationFrameAsync()
      this.hide = false
    })
  }

  calcInitialRects() {
    const container = document.querySelector('.board-decks')
    const elements = container.children
    this.initialRects = []

    for (let i = 0; i < elements.length; i++) {
      this.initialRects.push(elements[i].getBoundingClientRect())
    }
  }

  getNextIndex() {
    for (let i = 0; i < this.initialRects.length; i++) {
      const rect = this.initialRects[i]

      if (rect.left + rect.width >= this.x) {
        return i
      }
    }

    return this.initialRects.length - 1
  }

  @computed get style() {
    if (!this.moving) {
      let x = 0
      if (this.props.moveLeft) x = `calc(-100% - 20px)`
      if (this.props.moveRight) x = `calc(100% + 20px)`
      return {
        opacity: this.hide ? '0' : '1',
        transition: this.justPlaced ? '0s' : 'transform .3s',
        transform: `translateX(${x}) translateY(0)`,
      }
    }
    return {
      transition: '0s',
      transform: `translateX(${this.deltaX}px) translateY(${this.deltaY}px)`,
    }
  }

  setMoving = movingChild => {
    this.movingChild = movingChild
    if (movingChild) sharedState.moving.push(this)
    else sharedState.moving.remove(this)
  }

  setHoverIndex = index => {
    this.hoverIndex = index
    if (typeof index === 'number') {
      this.lastHoverIndex = index
      sharedState.lastHoverIndex = index
    }
  }

  setPlaceholderHeight = height => {
    this.placeholderHeight = height
  }

  setPlaceholderWidth = width => {
    this.placeholderWidth = width
  }

  onMouseOver = event => {
    if (!sharedState.moving.length) return

    for (const attribute of ['data-card', 'data-card-placeholder']) {
      const element = someParent(event.target, e => e.hasAttribute(attribute))
      if (element) {
        this.setHoverIndex(Number(element.getAttribute(attribute)))
        this.setPlaceholderHeight(element.offsetHeight)
        this.setPlaceholderWidth(element.offsetWidth)
        return
      }
    }
    const element = someParent(event.target, e =>
      e.hasAttribute('data-add-card-input'),
    )
    if (element) {
      const max = this.props.deck.cards.length
      this.setHoverIndex(max)
    } else {
      this.setHoverIndex(0)
    }
  }

  onMouseLeave = event => {
    this.setHoverIndex(null)
  }

  getLastHoverIndex = () => {
    return sharedState.lastHoverIndex
  }

  openContextMenu = event => {
    event.preventDefault()
    event.stopPropagation()
    this.openMenu(event)
  }

  setColor = ({ hex }) => {
    this.props.deck.color = hex
    api.setDeckColor({
      deckId: this.props.deck.deckId,
      color: hex,
    })
  }

  openMenu = event => {
    console.log('Opening menu...')
    this.props.showMenu(event, {
      Delete: () => {
        this.props.delete()
      },
      'Change color': event => {
        this.props.showModalInPlace(event, () => (
          <ColorPicker onChange={this.setColor} />
        ))
      },
    })
  }

  render() {
    return (
      <Container
        data-board-child={this.props.index}
        innerRef={e => (this.element = e)}
        className={this.props.className}
        onMouseOver={this.onMouseOver}
        onMouseLeave={this.onMouseLeave}
        onMouseDown={this.onMouseDown}
        movingChild={this.movingChild}
        moving={this.moving || this.movingChild}
        style={this.style}
      >
        <style>
          {'.moving-deck { pointer-events: none; user-select: none; }'}
        </style>
        <TopBar
          referencedByPortal={this.props.deck.referencedByPortal}
          onContextMenu={this.openContextMenu}
          color={this.props.deck.color}
        >
          <Title>
            {this.props.portal ? (
              <React.Fragment>
                <EditPortalTitle portal={this.props.portal} />
                <ReferencedBy>
                  <Arrow>←</Arrow>
                  <ReferenceBoardTitle>
                    {this.props.deck.boardTitle}
                  </ReferenceBoardTitle>
                  <ReferenceDeckTitle>
                    {this.props.deck.title}
                  </ReferenceDeckTitle>
                </ReferencedBy>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <EditDeckTitle deck={this.props.deck} />
                {this.props.deck.portals.map(portal => (
                  <ReferencedBy key={portal.portalId}>
                    <Arrow>→</Arrow>
                    <ReferenceBoardTitle>
                      {portal.boardTitle}
                    </ReferenceBoardTitle>
                    <ReferenceDeckTitle>{portal.title}</ReferenceDeckTitle>
                  </ReferencedBy>
                ))}
              </React.Fragment>
            )}
          </Title>
          <MenuIcon onClick={this.openMenu} />
        </TopBar>
        <Body>
          {this.props.deck.cards.map((card, index) => (
            <StyledCard
              moving={
                this.moving || this.movingChild || sharedState.moving.length
              }
              placeholderWidth={this.placeholderWidth}
              placeholderHeight={this.placeholderHeight}
              getLastHoverIndex={this.getLastHoverIndex}
              setHoverIndex={this.setHoverIndex}
              hoverIndex={this.hoverIndex}
              setMoving={this.setMoving}
              deck={this.props.deck}
              key={card.cardId}
              index={index}
              card={card}
            />
          ))}
          {Boolean(
            sharedState.moving.length &&
              this.hoverIndex === this.props.deck.cards.length,
          ) && (
            <div
              data-card-placeholder={this.props.deck.cards.length}
              style={{
                width:
                  this.placeholderWidth ||
                  sharedState.moving[0].placeholderWidth,
                height:
                  this.placeholderHeight ||
                  sharedState.moving[0].placeholderHeight,
              }}
            />
          )}
        </Body>
        <AddCardInput
          deck={this.props.deck}
          innerRef={e => (this.input = e)}
          isPortal={Boolean(this.props.portal)}
          referencedByPortal={this.props.deck.referencedByPortal}
        />
      </Container>
    )
  }
}

export default Deck

const Container = styled.div`
  user-select: none;
  flex-shrink: 0;
  flex-grow: 0;
  background: white;
  border-radius: 4px;
  width: 250px;
  box-shadow: ${theme.shadows[0]};
  ${p =>
    p.lifted &&
    css`
      box-shadow: ${theme.shadows[1]};
    `};
  z-index: ${p => (p.moving ? zIndexes.moving : zIndexes.movable)};
`

const Title = styled.div`
  flex-grow: 1;
`

const Body = styled.div`
  background: #eee;
`

const StyledCard = styled(Card)`
  border-bottom: 1px solid #ddd;
  padding: 10px;
  font-size: 0.8rem;
  line-height: 15px;
`

const ReferencedBy = styled.div`
  font-size: 10px;
  line-height: 12px;
`

const ReferenceBoardTitle = styled.span`
  margin-left: 3px;
  font-weight: bold;
  :after {
    content: ': ';
  }
`

const ReferenceDeckTitle = styled.span``

const Arrow = styled.span`
  font-weight: bold;
  font-size: 14px;
  position: relative;
  top: 1px;
  line-height: 12px;
`

const TopBar = styled.div`
  display: flex;
  background-color: ${p => {
    if (!p.color) return css`rgb(200, 200, 200)`
    return p.color || css`rgb(200, 200, 200)`
  }};
  color: ${p => {
    if (!p.color) return css`black`
    try {
      if (Color(p.color).blacken(0.7).isDark()) {
        return 'white'
      } else {
        return 'black'
      }
    } catch (e) {
      console.error('Failed determine foreground color')
      return 'black'
    }
  }};
  border-bottom: 1px solid #ddd;
  padding: 10px;
  cursor: move;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`

const TextArea = styled(AbstractTextArea)`
  background-color: transparent;
  font-size: inherit;
  color: inherit;
  display: block;
  resize: none;
  width: 80%;
  border: 0;
`

@observer
class EditPortalTitle extends React.Component {
  onChange = event => {
    this.props.portal.title = event.target.value
    clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      api.setPortalTitle({
        portalId: this.props.portal.portalId,
        title: this.props.portal.title,
      })
    }, 300)
  }

  render() {
    return <TextArea value={this.props.portal.title} onChange={this.onChange} />
  }
}

@observer
class EditDeckTitle extends React.Component {
  onChange = event => {
    this.props.deck.title = event.target.value
    clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      api.setDeckTitle({
        deckId: this.props.deck.deckId,
        title: this.props.deck.title,
      })
    }, 300)
  }

  render() {
    return <TextArea onChange={this.onChange} value={this.props.deck.title} />
  }
}
