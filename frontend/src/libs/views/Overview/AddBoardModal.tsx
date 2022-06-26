import { observer, inject } from 'mobx-react'
import { observable, action } from 'mobx'
import ModalFooter from 'ui/ModalFooter'
import styled from 'styled-components'
import Board from 'store/Board'
import Button from 'ui/Button'
import Input from 'ui/Input'
import Modal from 'ui/Modal'
import React from 'react'

@inject('store')
@observer
class AddBoardModal extends React.Component {
  @observable title = ''

  @action.bound setTitle(event) {
    this.title = event.target.value
  }

  @action.bound onSubmit(event) {
    event.preventDefault()
    this.props.store.addBoard(new Board(this.title))
    this.title = ''
    this.props.store.stopAddingBoard()
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <Modal hide={this.props.store.stopAddingBoard}>
          <Title>Name your board</Title>
          <Input
            placeholder="Enter a name"
            onChange={this.setTitle}
            value={this.title}
            autoFocus
          />
          <ModalFooter>
            <Button
              $gray
              type="button"
              onClick={this.props.store.stopAddingBoard}
            >
              Cancel
            </Button>
            <Button>Create</Button>
          </ModalFooter>
        </Modal>
      </form>
    )
  }
}

export default AddBoardModal

const Title = styled.h2`
  font-weight: normal;
  margin: 0;
  margin-bottom: 20px;
  color: #333;
`
