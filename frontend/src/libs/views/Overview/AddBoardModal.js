import { observer, inject } from 'mobx-react'
import { observable, action } from 'mobx'
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

  componentDidMount() {
    this.input.focus()
  }

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
            innerRef={e => (this.input = e)}
            placeholder="Enter a name"
            onChange={this.setTitle}
            value={this.title}
          />
          <Footer>
            <Button $gray type="button">
              Cancel
            </Button>
            <Button>Create</Button>
          </Footer>
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

const Footer = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
`
