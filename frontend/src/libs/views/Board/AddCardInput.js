import TextArea from 'react-textarea-autosize'
import renderToBody from 'util/renderToBody'
import { autobind } from 'core-decorators'
import { observable, action } from 'mobx'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import * as theme from 'theme'
import Card from 'store/Card'
import React from 'react'
import api from 'api'

@observer
class AddCardInput extends React.Component {
  @observable title = ''

  @action.bound setTitle(event) {
    this.title = event.target.value
  }

  @autobind async onSubmit(event) {
    event.preventDefault()

    await this.save()
  }

  @autobind async save() {
    if (!this.title) {
      this.warn('The input field can not be empty')
      return
    }

    const { cardId } = await api.addCard({
      title: this.title,
      deckId: this.props.deck.deckId,
    })

    const card = new Card(this.title, cardId)
    this.props.deck.addCard(card)
    this.title = ''
  }

  inputRef = input => {
    this.input = input
    typeof this.props.innerRef === 'function' && this.props.innerRef(input)
  }

  warn(warning) {
    if (this.warningOpen) return
    this.warningOpen = true
    const { left, top, height } = this.input.getBoundingClientRect()
    const duration = 3000
    let style = {
      position: 'fixed',
      top: top + height + 4,
      left,
      width: this.input.parentNode.clientWidth,
      backgroundColor: '#eee',
      zIndex: 1000,
      fontSize: '0.8rem',
      padding: '5px',
      boxShadow: theme.shadows[0],
      transform: 'scale(0)',
      transformOrigin: '50% 0',
      transition: 'transform .3s',
    }

    const { remove, rerender } = renderToBody(
      <div style={style}>{warning}</div>,
    )

    setTimeout(() => {
      style = { ...style, transform: 'scale(1)' }
      rerender(<div style={style}>{warning}</div>)
    }, 100)
    setTimeout(() => {
      style = { ...style, transform: 'scale(0)' }
      rerender(<div style={style}>{warning}</div>)
    }, duration - 300)
    setTimeout(() => {
      this.warningOpen = false
      remove()
    }, duration)
  }

  @autobind async submitIfEnter(event) {
    if (event.which !== 13) return

    event.preventDefault()

    await this.save()
  }

  render() {
    return (
      <Container onSubmit={this.onSubmit} data-add-card-input>
        <Input
          onKeyDown={this.submitIfEnter}
          value={this.title}
          onChange={this.setTitle}
          placeholder="Add card"
          inputRef={this.inputRef}
        />
        <Button
          isPortal={this.props.isPortal}
          referencedByPortal={this.props.referencedByPortal}
        >
          Add
        </Button>
      </Container>
    )
  }
}

export default AddCardInput

const Container = styled.form`
  display: flex;
`

const Input = styled(TextArea)`
  flex-grow: 1;
  resize: none;
  border: none;
  padding: 10px;
  display: block;
  border-radius: 4px;
  width: 100%;
  :focus {
    outline: none;
  }
`

const Button = styled.button`
  background: ${p =>
    p.isPortal
      ? theme.secondary1
      : p.referencedByPortal
      ? theme.tertiary1
      : theme.ui1};
  border: none;
  color: ${p => (p.isPortal ? '#707070' : 'white')};
  margin: 3px;
  border-radius: 4px;
  padding: 3px 10px;
`
