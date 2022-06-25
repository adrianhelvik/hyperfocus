import { autobind } from 'core-decorators'
import { observable, action } from 'mobx'
import ModalFooter from 'ui/ModalFooter'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import Button from 'ui/Button'
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
    const { deckId } = await api.addDeck({
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
        <Title>Create a deck</Title>
        <Input
          autofocus
          placeholder="Title"
          onChange={this.setTitle}
          value={this.title}
        />
        <ModalFooter>
          <Button $gray type="button" onClick={() => this.props.resolve()}>
            Cancel
          </Button>
          <Button>Create</Button>
        </ModalFooter>
      </Container>
    )
  }
}

export default AddDeck

const Container = styled.form``

const Title = styled.h2`
  margin: 0;
  margin-bottom: 30px;
  color: #333;
  font-size: 1.5rem;
  font-weight: normal;
`
