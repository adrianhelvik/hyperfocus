import { Observer, observer } from "mobx-react";
import PortalModel from "src/libs/store/Portal";
import withConfirm from "src/libs/withConfirm";
import { StoreContext } from "src/libs/store";
import { useContext, useState } from "react";
import DeckModel from "src/libs/store/Deck";
import * as theme from "src/libs/theme";
import styled from "styled-components";
import api from "src/libs/api";
import Portal from "./Portal";
import Deck from "./Deck";

export default withConfirm(
  observer(function DecksList({ confirm }) {
    const [indeces, setIndeces] = useState<{ from: number; to: number }>({
      from: null,
      to: null,
    });
    const store = useContext(StoreContext);

    const shouldIndexMoveRight = (index: number) => {
      if (indeces.from == null || indeces.to == null) return false;
      return (
        indeces.to < indeces.from && index >= indeces.to && index < indeces.from
      );
    };

    const shouldIndexMoveLeft = (index: number) => {
      if (indeces.from == null || indeces.to == null) return false;
      return (
        indeces.to > indeces.from && index > indeces.from && index <= indeces.to
      );
    };

    const simulateMove = (from: number, to: number) => {
      setIndeces((prev) => {
        const next = { ...prev };

        if (from === to) {
          if (next.from != null || next.to != null) next.from = next.to = null;
          return next;
        }

        if (next.from !== from) next.from = from;
        if (next.to !== to) next.to = to;

        return next;
      });
    };

    const move = (fromIndex: number, toIndex: number) => {
      let item = store.board.children[fromIndex];

      if (item instanceof PortalModel)
        item = { type: "portal", portalId: item.portalId };
      else if (item instanceof DeckModel)
        item = { type: "deck", deckId: item.deckId };
      else {
        console.error("Invalid type:", item);
        throw Error("Invalid type. Check log");
      }

      store.board.move(fromIndex, toIndex);

      api.moveBoardChildToIndex({
        boardId: store.board.boardId,
        index: toIndex,
        item,
      });
    };

    return (
      <Observer>
        {() => (
          <Decks className="board-decks">
            {store.board.children.length === 0 && (
              <Empty>
                There are no decks here yet.
                <br />
                Click{" "}
                <span className="material-symbols-outlined">add_circle</span> to
                create your first deck!
              </Empty>
            )}
            {store.board.children.map((child, index) => {
              const props = {
                simulateMove: simulateMove,
                moveRight: shouldIndexMoveRight(index),
                moveLeft: shouldIndexMoveLeft(index),
                move: move,
                index: index,
                board: store.board,
              };

              if (child instanceof PortalModel) {
                return (
                  <ChildPortal
                    delete={async () => {
                      const confirmed = await confirm(({ yes, no }) => (
                        <div>
                          <div>Delete portal</div>
                          <button onClick={yes}>Delete</button>
                          <button onClick={no}>Keep</button>
                        </div>
                      ));
                      if (!confirmed) return;
                      api.deletePortal({
                        portalId: child.portalId,
                      });
                      store.board.children.splice(index, 1);
                    }}
                    key={child.portalId}
                    portal={child}
                    deck={child.target}
                    {...props}
                  />
                );
              }

              return (
                <ChildDeck
                  delete={async () => {
                    const confirmed = await confirm(({ yes, no }) => (
                      <div>
                        <div>Delete deck</div>
                        <div>
                          All cards in the deck will be deleted as well.
                        </div>
                        <button onClick={yes}>Delete</button>
                        <button onClick={no}>Keep</button>
                      </div>
                    ));
                    if (!confirmed) return;
                    api.deleteDeck({
                      deckId: child.deckId,
                    });
                    store.board.children.splice(index, 1);
                  }}
                  key={child.deckId}
                  deck={child}
                  {...props}
                />
              );
            })}
          </Decks>
        )}
      </Observer>
    );
  })
);

const Decks = styled.div`
  display: flex;
  overflow: auto;
  flex-grow: 1;
  padding-bottom: 100px;
  align-items: flex-start;
`;

const ChildDeck = styled(Deck as any)`
  margin: 20px;
  :not(:last-child) {
    margin-right: 0;
  }
`;

const ChildPortal = styled(Portal as any)`
  margin: 20px;
  :not(:last-child) {
    margin-right: 0;
  }
`;

const Empty = styled.div`
  text-align: center;
  font-size: 30px;
  user-select: none;
  text-align: center;
  color: ${theme.placeholderGray};
  margin: 0 auto;
  margin-top: 100px;
  line-height: 1.5;
  > span {
    font-size: 30px;
    position: relative;
    top: 5px;
  }
`;
