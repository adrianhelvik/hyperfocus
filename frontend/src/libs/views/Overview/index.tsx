import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { MouseEvent, useContext, useEffect } from "react";
import { AuthContext } from "src/libs/authContext";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "src/libs/store";
import AddBoardModal from "./AddBoardModal";
import classes from "./styles.module.css";
import Header from "src/libs/ui/Header";
import styled from "styled-components";
import { Observer } from "mobx-react";
import BoardList from "./BoardList";

type Props = WithMenuProps & {
  children?: React.ReactNode;
};

export default withMenu(function Overview(props: Props) {
  const store = useContext(StoreContext)!;
  const auth = useContext(AuthContext)!;
  const navigate = useNavigate();

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();

    props.showMenu(event, {
      "New board": () => {
        store.isAddingBoard = true;
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

  return (
    <Observer>
      {() => {
        return (
          <div onContextMenu={onContextMenu}>
            <Header>My boards</Header>
            {store.isAddingBoard && <AddBoardModal />}
            <BoardList />
          </div>
        );
      }}
    </Observer>
  );
});
