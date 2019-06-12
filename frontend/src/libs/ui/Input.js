import styled, { css } from 'styled-components'
import { observer } from 'mobx-react'
import withEvents from 'util/withEvents'
import { observable, computed } from 'mobx'
import * as theme from '../theme'
import React from 'react'

@withEvents
@observer
class Input extends React.Component {
  @observable showPassword = false

  @computed get overrideType() {
    if (this.showPassword)
      return 'text'
    return null
  }

  componentDidMount() {
    if (this.props.autofocus)
      this.element.focus()
    this.props.on(document, 'mouseup', e => {
      if (this.showPassword)
        this.showPassword = false
    })
  }

  innerRef = element => {
    if (typeof this.props.innerRef === 'function')
      this.props.innerRef(element)
    this.element = element
  }

  show = event => {
    this.showPassword = true
  }

  render() {
    return (
      <Container>
        <Label>
          <Field
            onChange={this.props.onChange}
            value={this.props.value}
            innerRef={this.innerRef}
            type={this.overrideType || this.props.type}
            forPassword={this.props.type === 'password'}
            colored={this.showPassword}
          />
          <LabelText
            hasContent={Boolean(this.props.value)}
          >
            {this.props.placeholder}
          </LabelText>
        </Label>
        {this.props.type === 'password' &&
            <Icon
              colored={this.showPassword}
              className="material-icons"
              onMouseDown={this.show}
            >
              remove_red_eye
            </Icon>
        }
      </Container>
    )
  }
}

export default Input

const padding = '7px 5px'
const fontSize = '1rem'

const Container = styled.div`
  position: relative;
  margin-top: 15px;
`

const Field = styled.input`
  font-size: ${fontSize};
  padding: ${padding};
  border: 1px solid ${theme.gray1};
  box-sizing: border-box;
  width: 200px;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: ${theme.ui1};
  }
  &:focus + * {
    transform: translateY(calc(-100% - 7px)) scale(0.7) translateX(-5px);
    color: ${theme.ui1};
  }
  ${p => p.forPassword && css`
    padding-right: 30px;
  `}
  ${p => p.colored && css`
    border-color: ${theme.ui1};
  `}
`

const LabelText = styled.div`
  position: absolute;
  font-size: ${fontSize};
  padding: ${padding};
  pointer-events: none;
  color: ${theme.gray1};
  top: 50%;
  left: 3px;
  transform: translateY(-50%);
  transform-origin: 0 0;
  transition: .3s;
  ${props => props.hasContent && css`
    transform: translateY(calc(-100% - 7px)) scale(0.7) translateX(-5px);
  `}
  :-webkit-autofill + & {
    transform: translateY(calc(-100% - 7px)) scale(0.7) translateX(-5px);
  }
`

const Label = styled.label`
`

const Icon = styled.i`
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  ${p => p.colored && css`
    color: ${theme.ui1};
  `}
`
