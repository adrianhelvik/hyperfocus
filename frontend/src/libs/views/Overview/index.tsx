import { MouseEvent, useContext, useEffect, useState } from "react";
import { OverviewStoreContext } from "./OverviewStoreContext";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { useAutoCallback, useAutoMemo } from "hooks.macro";
import { AuthContext } from "src/libs/authContext";
import { useNavigate } from "react-router-dom";
import AddBoardModal from "./AddBoardModal";
import { GlobalStyle } from "./components";
import Header from "src/libs/ui/Header";
import { Board } from "src/libs/types";
import BoardList from "./BoardList";
import api from "src/libs/api";

type Props = WithMenuProps & {
  children?: React.ReactNode;
};

export default withMenu(function Overview(props: Props) {
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [boards, setBoards] = useState<Board[] | null>(null);
  const auth = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    api.ownBoards().then(({ boards }) => {
      setBoards(boards);
    });
  }, []);

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();

    props.showMenu(event, {
      "New board": () => {
        setIsAddingBoard(true);
      },
    });
  };

  useEffect(() => {
    auth.authenticate();
  }, [auth]);

  useEffect(() => {
    if (auth.status === "failure") {
      navigate("/");
    }
  }, [auth.status]);

  const onBoardAdded = useAutoCallback((board: Board) => {
    setBoards((boards) => boards === null ? null : [board, ...boards]);
  });

  const onBoardRemoved = useAutoCallback((board: Board) => {
    setBoards((boards) => boards === null ? null : boards.filter((it) => it.boardId !== board.boardId));
  });

  const onBoardColorChanged = (boardId: string, color: string | null) => {
    setBoards(boards => {
      if (boards === null) return null;
      return boards.map(board => {
        if (board.boardId === boardId) {
          return {
            ...board,
            color,
          }
        }
        return board;
      });
    });
  };

  const contextValue = useAutoMemo({
    onBoardColorChanged,
    setIsAddingBoard,
    onBoardRemoved,
    isAddingBoard,
    onBoardAdded,
    boards,
  });

  return (
    <OverviewStoreContext.Provider value={contextValue}>
      <GlobalStyle />
      <div onContextMenu={onContextMenu}>
        <Header />
        {isAddingBoard && <AddBoardModal />}
        <BoardList />
      </div>
    </OverviewStoreContext.Provider>
  );
});
