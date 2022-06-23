import { inject, observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import AddBoardModal from './AddBoardModal'
import { withAuth } from 'authContext'
import styled from 'styled-components'
import BoardList from './BoardList'
import withMenu from 'withMenu'
import Header from 'ui/Header'
import React from 'react'

@withMenu
@withAuth
@inject('store')
@observer
class Overview extends React.Component {
  componentDidMount() {
    this.props.auth.authenticate()
  }

  onContextMenu = event => {
    event.preventDefault()

    this.props.showMenu(event, {
      'New board': () => {
        this.props.store.isAddingBoard = true
      },
    })
  }

  render() {
    if (this.props.auth.status === 'failure') return <Redirect to="/" />

    return (
      <Container onContextMenu={this.onContextMenu}>
        <Header />
        {this.props.store.isAddingBoard && <AddBoardModal />}
        <BoardList />
      </Container>
    )
  }
}

export default Overview

const Container = styled.div`
  background-color: #eee;
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
  overflow: auto;
`
