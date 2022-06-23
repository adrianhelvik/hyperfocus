import styled, { css } from 'styled-components'
import { observer, inject } from 'mobx-react'
import { observable, action } from 'mobx'
import PortalModel from 'store/Portal'
import BoardModel from 'store/Board'
import onSelect from 'util/onSelect'
import DeckModel from 'store/Deck'
import * as theme from 'theme'
import Input from 'ui/Input'
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
        <InputWrapper>
          <Input
            placeholder="Title"
            autofocus
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
                selected={this.board === board}
                {...onSelect(() => this.setBoard(board))}
              >
                {board.title}
              </Tile>
            ))}
          </Section>
          <Section>
            <Title>Select Deck</Title>
            {this.board &&
              this.board.decks.map(deck => (
                <Tile
                  key={deck.deckId}
                  selected={this.deck === deck}
                  {...onSelect(() => this.setDeck(deck))}
                >
                  {deck.title}
                </Tile>
              ))}
          </Section>
        </Sections>
        <hr />
        <AddButton active={this.board && this.deck && this.title}>
          Add
        </AddButton>
      </form>
    )
  }
}

export default AddPortal

const Sections = styled.div`
  display: flex;
`

const Tile = styled.div`
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
    p.selected &&
    css`
      background: ${theme.ui1};
      color: white;
    `};
`

const AddButton = styled.button`
  border: none;
  color: white;
  font-size: 0.8rem;
  padding: 10px;
  border-radius: 4px;
  background: ${p => (p.active ? theme.ui1 : '#ddd')};
  width: fit-content;
  display: block;
  margin-left: auto;
  cursor: ${p => (p.active ? 'pointer' : 'not-allowed')};
  :focus {
    outline: none;
    ${p =>
      p.active &&
      css`
        background: ${theme.ui2};
      `}
  }
  :active:hover {
    ${p =>
      p.active &&
      css`
        background: #707070;
      `}
  }
`

const Section = styled.section`
  :not(:last-child) {
    margin-right: 10px;
  }
  min-width: 200px;
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
