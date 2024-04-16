import Store, { StoreContext } from "src/libs/store";
import { observer } from "mobx-react";
import { reaction } from "mobx";
import api from "src/libs/api";
import React from "react";

@observer
export default class Reactions extends React.Component<{
  children?: React.ReactNode;
}> {
  static contextType = StoreContext;
  declare context: Store;

  componentDidMount() {
    this.dispose = reaction(
      () => this.context.uncomittedBoards.length,
      (pendingBoards) => {
        if (!pendingBoards) return;

        const uncomittedBoards = this.context.uncomittedBoards.slice();
        this.context.uncomittedBoards.replace([]);

        for (const board of uncomittedBoards) {
          api.createBoard(board).catch((e: Error) => {
            console.error("Failed to create board:", board);
            for (let i = 0; i < this.context.boards.length; i++) {
              if (this.context.boards[i].boardId === board.boardId) {
                this.context.boards.splice(i, 1);
                break;
              }
            }
            setTimeout(() => {
              alert(e.message);
            }, 100);
          });
        }
      }
    );
  }

  disposers: (() => void)[] = [];

  set dispose(disposer: () => void) {
    this.disposers.push(disposer);
  }

  componentWillUnmount() {
    this.disposers.forEach((dispose) => dispose());
  }

  render() {
    return this.props.children;
  }
}
