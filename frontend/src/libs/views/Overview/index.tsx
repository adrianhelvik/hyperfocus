import { MouseEvent, useContext, useEffect, useState } from "react";
import { OverviewStoreContext } from "./OverviewStoreContext";
import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { useAutoCallback, useAutoMemo } from "hooks.macro";
import { AuthContext } from "src/libs/authContext";
import { useNavigate } from "react-router-dom";
import AddBoardModal from "./AddBoardModal";
import classes from "./styles.module.css";
import Header from "src/libs/ui/Header";
import { Board } from "src/libs/types";
import BoardList from "./BoardList";
import api from "src/libs/api";

type Props = WithMenuProps & {
  children?: React.ReactNode;
};

export default withMenu(function Overview(props: Props) {
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
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

  useEffect(() => {
    document.body.classList.add(classes.body);
    return () => {
      document.body.classList.add(classes.body);
    };
  }, []);

  const onBoardAdded = useAutoCallback((board: Board) => {
    setBoards((boards) => [board, ...boards]);
  });

  const onBoardRemoved = useAutoCallback((board: Board) => {
    setBoards((boards) => boards.filter((it) => it.boardId !== board.boardId));
  });

  const contextValue = useAutoMemo({
    setIsAddingBoard,
    onBoardRemoved,
    isAddingBoard,
    onBoardAdded,
    boards,
  });

  return (
    <OverviewStoreContext.Provider value={contextValue}>
      <div onContextMenu={onContextMenu}>
        <Header>My boards</Header>
        {isAddingBoard && <AddBoardModal />}
        <BoardList />
      </div>
    </OverviewStoreContext.Provider>
  );
});
