import styled, { css } from 'styled-components'
import { observer, inject } from 'mobx-react'
import { observable, action } from 'mobx'
import ModalFooter from 'ui/ModalFooter'
import PortalModel from 'store/Portal'
import BoardModel from 'store/Board'
import onSelect from 'util/onSelect'
import DeckModel from 'store/Deck'
import ellipsify from 'ellipsify'
import Button from 'ui/Button'
import * as theme from 'theme'
import Input from 'ui/Input'
import Help from 'ui/Help'
import React from 'react'
import api from 'api'

@inject('store')
@observer
class AddPortal extends React.Component {
  @observable board = null
  @observable deck = null
  @observable title = ''

  async componentDidMount() {
    const { boards } = await api.ownBoards()
    this.props.store.setBoards(
      boards.map(({ children, ...board }) => {
        return new BoardModel({
          children: children.map(child => {
            if (child.type === 'deck') return new DeckModel(child)
            if (child.type === 'portal') return new PortalModel(child)
            throw Error(`Invalid child type: ${child.type}`)
          }),
          ...board,
        })
      }),
    )
  }

  @action setBoard(board) {
    this.board = board
    this.deck = null
  }

  @action setDeck(deck) {
    this.deck = deck
  }

  @action setTitle(title) {
    this.title = title
  }

  onSubmit = async event => {
    event.preventDefault()
    if (!this.board || !this.deck || !this.title) return
    const { portalId } = await api.addPortal({
      boardId: this.props.board.boardId,
      deckId: this.deck.deckId,
      index: this.props.index,
      title: this.title,
    })
    this.props.board.addPortal({
      boardId: this.props.board.boardId,
      deckId: this.deck.deckId,
      index: this.props.index,
      target: this.deck,
      title: this.title,
      portalId,
    })
    this.props.resolve()
  }

  render() {
    const { store } = this.props

    return (
      <form onSubmit={this.onSubmit}>
        <MainTitle>
          Create portal{' '}
          <Help iconStyle={{ fontSize: '25px' }}>
            A portal is a link to a deck from another board. With portals it
            becomes easier to move cards from one board to another.
          </Help>
        </MainTitle>
        <InputWrapper>
          <Input
            placeholder="Name in this board"
            autoFocus
            value={this.title}
            onChange={e => this.setTitle(e.target.value)}
          />
        </InputWrapper>
        <Sections>
          <Section>
            <Title>Select board</Title>
            {store.boards.map(board => (
              <Tile
                key={board.boardId}
                $selected={this.board === board}
                $empty={board.decks.length === 0}
                {...onSelect(() => this.setBoard(board))}
              >
                {ellipsify(board.title || 'Untitled')}
              </Tile>
            ))}
          </Section>
          <Section>
            <Title>Select Deck</Title>
            {this.board &&
              this.board.decks.map(deck => (
                <Tile
                  key={deck.deckId}
                  $selected={this.deck === deck}
                  {...onSelect(() => this.setDeck(deck))}
                >
                  {ellipsify(deck.title || 'Untitled')}
                </Tile>
              ))}
          </Section>
        </Sections>
        <hr />
        <ModalFooter>
          <Button $gray onClick={() => this.props.resolve()}>
            Cancel
          </Button>
          <Button disabled={!this.board || !this.deck || !this.title}>
            Create portal
          </Button>
        </ModalFooter>
      </form>
    )
  }
}

export default AddPortal

const Sections = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`

const Tile = styled.button.attrs({
  type: 'button',
})`
  width: 100%;
  border: 1px solid transparent;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  background: #ddd;
  :not(:last-child) {
    margin-bottom: 10px;
  }
  :focus {
    outline: none;
    border-color: #707070;
  }
  :active:hover {
    background: #707070;
    color: white;
  }

  ${p =>
    p.$selected &&
    css`
      background: ${theme.ui1};
      color: white;
    `};

  ${p =>
    p.$empty &&
    css`
      opacity: 0.5;
    `}
`

const Section = styled.section`
  :not(:last-child) {
    margin-right: 10px;
  }
  min-width: 200px;
  min-height: 400px;
  max-height: calc(100vh - 400px);
  overflow: auto;
`

const Title = styled.div`
  font-size: 0.8rem;
  color: #707070;
  border-bottom: 1px solid #707070;
  margin-bottom: 10px;
`

const InputWrapper = styled.div`
  padding-bottom: 10px;
  margin-bottom: 10px;
`

const MainTitle = styled.h2`
  margin: 0;
  margin-bottom: 30px;
  color: #333;
  font-size: 1.5rem;
  font-weight: normal;
`
