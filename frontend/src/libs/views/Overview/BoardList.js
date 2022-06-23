import { observer, inject } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import { withAuth } from 'authContext'
import styled from 'styled-components'
import BoardTile from './BoardTile'
import Board from 'store/Board'
import * as theme from 'theme'
import React from 'react'
import api from 'api'

@withAuth
@inject('store')
@observer
class BoardList extends React.Component {
  async componentDidMount() {
    if (!(await this.props.auth.authenticate())) return

    const { boards } = await api.ownBoards()

    this.props.store.setBoards(boards.map(b => new Board(b)))
  }

  render() {
    if (this.props.auth.status === 'failed') return <Redirect to="/login" />
    return (
      <Container>
        <Title>My boards</Title>
        <Area>
          {this.props.store.boards.map(board => (
            <BoardTile key={board.boardId} board={board} />
          ))}
        </Area>
        <Button onClick={this.props.store.startAddingBoard}>New board</Button>
      </Container>
    )
  }
}

export default BoardList

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  margin-top: 40px;
`

const Title = styled.h2`
  font-weight: 400;
  margin-left: 20px;
  margin-bottom: 0;
  margin-top: 20px;
  font-size: 25px;
  color: ${theme.ui1};
  letter-spacing: 0.1rem;
`

const Area = styled.div`
  padding: 20px;
`

const Button = styled.button`
  display: block;
  border: none;
  background: ${theme.ui1};
  color: white;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  margin: 20px;
`

const Text = styled.div` // eslint-disable-line
  font-size: 18px;
  color: #333;
`
