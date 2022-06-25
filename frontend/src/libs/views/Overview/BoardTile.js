import { withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import withConfirm from 'withConfirm'
import onSelect from 'util/onSelect'
import withStatus from 'withStatus'
import MenuIcon from 'ui/MenuIcon'
import withMenu from 'withMenu'
import * as theme from 'theme'
import React from 'react'
import api from 'api'

@withConfirm
@withStatus
@withMenu
@withRouter
@inject('store')
@observer
class BoardTile extends React.Component {
  onSelect = () => {
    this.props.history.push(`/board/${this.props.board.boardId}`)
  }

  openMenu = event => {
    event.preventDefault()
    event.stopPropagation()
    event = event.nativeEvent
    this.props.showMenu(event, {
      Delete: async () => {
        if (
          !(await this.props.confirmInPlace(event, p => (
            <div>
              <div>Delete board permanently</div>
              <button onClick={p.yes}>Yes</button>
              <button onClick={p.no}>No</button>
            </div>
          )))
        )
          return
        const { boardId } = this.props.board
        try {
          await api.deleteBoard({
            boardId,
          })
          this.props.store.deleteBoard(boardId)
        } catch (e) {
          this.props.showStatus(() => (
            <div>
              Whoopsie! That caused an error!
              <br />
              <br />
              <details>
                <summary style={{ cursor: 'pointer' }}>Error details</summary>
                <pre>{e.stack}</pre>
              </details>
            </div>
          ))
        }
      },
    })
  }

  render() {
    return (
      <Container {...onSelect(this.onSelect)} onContextMenu={this.openMenu}>
        <Title>{this.props.board.title || <Weak>Untitled</Weak>}</Title>
        <MenuIcon $dark onClick={this.openMenu} />
      </Container>
    )
  }
}

export default BoardTile

const Container = styled.div`
  cursor: pointer;
  padding: 10px;
  background: white;
  color: #707070;
  border-radius: 4px;
  margin-right: 10px;
  margin-bottom: 10px;
  position: relative;
  display: inline-flex;
  box-shadow: ${theme.shadows[0]};
  transition: box-shadow 0.3s;
  height: 80px;

  :hover {
    box-shadow: ${theme.shadows[1]};
  }
`

const Title = styled.div`
  overflow: hidden;
  width: 100%;
`

const Weak = styled.span`
  color: ${theme.placeholderGray};
`
