import { observer, inject } from 'mobx-react'
import { observable, action } from 'mobx'
import styled from 'styled-components'
import Board from 'store/Board'
import * as theme from 'theme'
import Input from 'ui/Input'
import Modal from 'ui/Modal'
import React from 'react'

@inject('store')
@observer
class AddBoardModal extends React.Component {
  @observable title = ''

  componentDidMount() {
    this.input.focus()
  }

  @action.bound setTitle(event) {
    this.title = event.target.value
  }

  @action.bound onSubmit(event) {
    event.preventDefault()
    this.props.store.addBoard(
      new Board(this.title)
    )
    this.title = ''
    this.props.store.stopAddingBoard()
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <Modal hide={this.props.store.stopAddingBoard}>
          <Input
            innerRef={e => this.input = e}
            placeholder="Name of board"
            onChange={this.setTitle}
            value={this.title}
          />
          <Button>Create</Button>
        </Modal>
      </form>
    )
  }
}

export default AddBoardModal

const Button = styled.button`
  display: block;
  margin-left: auto;
  border: none;
  background: ${theme.ui1};
  color: white;
  margin-top: 10px;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 1rem;
  cursor: pointer;
`
