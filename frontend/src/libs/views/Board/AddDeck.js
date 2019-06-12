import { autobind } from 'core-decorators'
import { observable, action } from 'mobx'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import * as theme from 'theme'
import Deck from 'store/Deck'
import Input from 'ui/Input'
import React from 'react'
import api from 'api'

@observer
class AddDeck extends React.Component {
  @observable loading = false
  @observable title = ''

  @action.bound setTitle(event) {
    this.title = event.target.value
  }

  @autobind async onSubmit(event) {
    if (this.loading) return
    this.loading = true
    event.preventDefault()
    const {deckId} = await api.addDeck({
      boardId: this.props.board.boardId,
      title: this.title,
      index: this.props.index,
    })
    const deck = new Deck({
      deckId,
      boardId: this.props.board.boardId,
      portals: [],
      title: this.title,
    })
    deck.initialFocus = true
    this.props.board.addDeck(deck, this.props.index)
    this.props.resolve()
  }

  render() {
    return (
      <Container onSubmit={this.onSubmit}>
        <Input
          autofocus
          placeholder="Title"
          onChange={this.setTitle}
          value={this.title}
        />
        <Button>Create</Button>
      </Container>
    )
  }
}

export default AddDeck

const Container = styled.form`
`

const Button = styled.button`
  display: block;
  border: none;
  background: ${theme.ui1};
  color: white;
  margin-top: 10px;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 10px;
  margin-left: auto;
`
