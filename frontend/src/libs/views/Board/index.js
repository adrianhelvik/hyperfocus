import { runInAction, observable, computed, action } from 'mobx'
import { Redirect, withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import PortalModel from 'store/Portal'
import withConfirm from 'withConfirm'
import BoardModel from 'store/Board'
import styled from 'styled-components'
import DeckModel from 'store/Deck'
import withModal from 'withModal'
import AddPortal from './AddPortal'
import AddCircle from './AddCircle'
import Loading from 'ui/Loading'
import AddDeck from './AddDeck'
import withMenu from 'withMenu'
import * as theme from 'theme'
import Portal from './Portal'
import Deck from './Deck'
import React from 'react'
import api from 'api'

@withConfirm
@withRouter
@withModal
@withMenu
@inject('store')
@observer
class Board extends React.Component {
  @observable fromIndex = null
  @observable loading = true
  @observable toIndex = null
  @observable error = null

  @computed get board() {
    return this.props.store.board
  }

  async componentDidMount() {
    try {
      var { boardId, title, children } = await api.getBoard({
        boardId: this.props.match.params.boardId,
      })
    } catch (e) {
      alert(e.message)
      this.props.history.push('/app')
      return
    }

    runInAction(() => {
      const board = new BoardModel({
        children: children.map(child => {
          if (child.type === 'deck') return new DeckModel(child)
          if (child.type === 'portal')
            return new PortalModel({
              ...child,
              target: new DeckModel(child.target),
            })
          throw Error('Invalid child type')
        }),
        boardId,
        title,
      })

      this.props.store.setActiveBoard(new BoardModel(board))

      this.loading = false
    })
  }

  componentDidCatch(error) {
    this.error = error
    setTimeout(() => {
      this.error = null
    }, 5000)
  }

  addDeck = async () => {
    await this.props.showModal(props => (
      <AddDeck {...props} board={this.board} />
    ))
  }

  addDeckFromContextMenu = async event => {
    const { clientX } = event

    const index = this.insertionPointForChild(clientX)

    console.log(index)

    await this.props.showModal(props => (
      <AddDeck {...props} board={this.board} index={index} />
    ))
  }

  addPortalFromContextMenu = async event => {
    const { clientX } = event

    const index = this.insertionPointForChild(clientX)

    console.log(index)

    await this.props.showModal(props => (
      <AddPortal {...props} board={this.board} index={index} />
    ))
  }

  insertionPointForChild(x) {
    const deckElements = document.querySelectorAll('[data-board-child]')

    if (!deckElements.length) return 0

    let i = -1
    while (
      deckElements[++i] &&
      deckElements[i].getBoundingClientRect().left +
        deckElements[i].getBoundingClientRect().width / 2 <
        x
    );

    return i
  }

  addPortal = async ({ resolve, reject }) => {
    await this.props.showModal(props => (
      <AddPortal {...props} board={this.board} />
    ))
  }

  @action.bound simulateMove(fromIndex, toIndex) {
    if (fromIndex === toIndex) {
      if (this.fromIndex != null || this.toIndex != null)
        this.fromIndex = this.toIndex = null
      return
    }

    if (this.fromIndex !== fromIndex) this.fromIndex = fromIndex
    if (this.toIndex !== toIndex) this.toIndex = toIndex
  }

  @computed get moveRight() {
    const moveRight = []
    for (let i = 0; i < this.board.children.length; i++)
      if (this.shouldIndexMoveRight(i)) moveRight.push(i)
    return moveRight
  }

  @computed get moveLeft() {
    const moveLeft = []
    for (let i = 0; i < this.board.children.length; i++)
      if (this.shouldIndexMoveLeft(i)) moveLeft.push(i)
    return moveLeft
  }

  shouldIndexMoveRight(index) {
    if (this.fromIndex == null || this.toIndex == null) return false
    return (
      this.toIndex < this.fromIndex &&
      index >= this.toIndex &&
      index < this.fromIndex
    )
  }

  shouldIndexMoveLeft(index) {
    if (this.fromIndex == null || this.toIndex == null) return false
    return (
      this.toIndex > this.fromIndex &&
      index > this.fromIndex &&
      index <= this.toIndex
    )
  }

  shouldMoveLeft(index) {
    return false
  }

  @action.bound move(fromIndex, toIndex) {
    let item = this.board.children[fromIndex]

    if (item instanceof PortalModel)
      item = { type: 'portal', portalId: item.portalId }
    else if (item instanceof DeckModel)
      item = { type: 'deck', deckId: item.deckId }
    else {
      console.error('Invalid type:', item)
      throw Error('Invalid type. Check log')
    }

    this.board.move(fromIndex, toIndex)

    api.moveBoardChildToIndex({
      boardId: this.board.boardId,
      index: toIndex,
      item,
    })
  }

  onContextMenu = event => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')
      return
    event.preventDefault()
    this.props.showMenu(event, {
      'Add deck': event => {
        this.addDeckFromContextMenu(event)
      },
      'Add portal': event => {
        this.addPortalFromContextMenu(event)
      },
    })
  }

  render() {
    if (this.loading) {
      return <Loading />
    }

    if (!this.board) {
      return <Redirect to="/" />
    }

    if (this.error) return null

    return (
      <Container onContextMenu={this.onContextMenu}>
        <Header>
          <GoBack onClick={() => this.props.history.goBack()}>◀</GoBack>
          <Title>{this.board.title}</Title>
        </Header>
        <Decks className="board-decks">
          {this.board.children.map((child, index) => {
            const props = {
              childContainer: this.childContainer,
              simulateMove: this.simulateMove,
              moveRight: this.moveRight.includes(index),
              moveLeft: this.moveLeft.includes(index),
              move: this.move,
              index: index,
              board: this.props.board,
            }

            if (child instanceof PortalModel) {
              return (
                <ChildPortal
                  delete={async () => {
                    const confirmed = await this.props.confirm(
                      ({ yes, no }) => (
                        <div>
                          <div>Delete portal</div>
                          <button onClick={yes}>Delete</button>
                          <button onClick={no}>Keep</button>
                        </div>
                      ),
                    )
                    if (!confirmed) return
                    api.deletePortal({ portalId: child.portalId })
                    this.board.children.splice(index, 1)
                  }}
                  key={child.portalId}
                  portal={child}
                  deck={child.target}
                  {...props}
                />
              )
            }

            return (
              <ChildDeck
                delete={async () => {
                  const confirmed = await this.props.confirm(({ yes, no }) => (
                    <div>
                      <div>Delete deck</div>
                      <div>All cards in the deck will be deleted as well.</div>
                      <button onClick={yes}>Delete</button>
                      <button onClick={no}>Keep</button>
                    </div>
                  ))
                  if (!confirmed) return
                  api.deleteDeck({ deckId: child.deckId })
                  this.board.children.splice(index, 1)
                }}
                key={child.deckId}
                deck={child}
                {...props}
              />
            )
          })}
        </Decks>
        <AddCircle>
          <AddItem onClick={this.addDeck}>
            <AddItemText>Add Deck</AddItemText>
          </AddItem>
          <AddItem onClick={this.addPortal}>
            <AddItemText>Add portal</AddItemText>
          </AddItem>
        </AddCircle>
      </Container>
    )
  }
}

export default Board

const Container = styled.main`
  background: #ddd;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  background: ${theme.ui1};
  padding: 10px;
  color: white;
`

const Title = styled.div`
  display: inline-block;
`

const AddItem = styled.div`
  background: ${theme.ui1};
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: ${theme.ui2};
  }
  padding: 10px;
  height: 55px;
  display: flex;
  align-items: flex-start;

  :first-child {
    border-top-left-radius: 4px;
  }
`

const AddItemText = styled.div`
  margin: auto;
  color: white;
`

const Decks = styled.div`
  display: flex;
  overflow: auto;
  flex-grow: 1;
  padding-bottom: 100px;
  align-items: flex-start;
`

const ChildDeck = styled(Deck)`
  margin: 20px;
  :not(:last-child) {
    margin-right: 0;
  }
`

const ChildPortal = styled(Portal)`
  margin: 20px;
  :not(:last-child) {
    margin-right: 0;
  }
`

const GoBack = styled.div`
  display: inline-block;
  margin-right: 10px;
  cursor: pointer;
`
