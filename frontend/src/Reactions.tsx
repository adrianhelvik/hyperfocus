import { inject, observer } from 'mobx-react'
import { reaction } from 'mobx'
import React from 'react'
import api from 'api'

@inject('store')
@observer
class Reactions extends React.Component {
  componentDidMount() {
    this.dispose = reaction(
      () => this.props.store.uncomittedBoards.length,
      pendingBoards => {
        if (!pendingBoards) return

        const uncomittedBoards = this.props.store.uncomittedBoards.slice()
        this.props.store.uncomittedBoards.replace([])

        for (const board of uncomittedBoards) {
          api.createBoard(board).catch(e => {
            console.error('Failed to create board:', board)
            for (let i = 0; i < this.props.store.boards.length; i++) {
              if (this.props.store.boards[i].boardId === board.boardId) {
                this.props.store.boards.splice(i, 1)
                break
              }
            }
            setTimeout(() => {
              alert(e.message)
            }, 100)
          })
        }
      },
    )
  }

  disposers = []

  set dispose(disposer) {
    this.disposers.push(disposer)
  }

  componentWillUnmount() {
    this.disposers.forEach(dispose => dispose())
  }

  render() {
    return this.props.children
  }
}

export default Reactions
