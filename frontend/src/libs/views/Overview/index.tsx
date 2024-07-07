import withMenu, { WithMenuProps } from "src/libs/withMenu";
import { MouseEvent, useContext, useEffect } from "react";
import { AuthContext } from "src/libs/authContext";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "src/libs/store";
import AddBoardModal from "./AddBoardModal";
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

  return (
    <Observer>
      {() => {
        return (
          <Container onContextMenu={onContextMenu}>
            <Header>My boards</Header>
            {store.isAddingBoard && <AddBoardModal />}
            <BoardList />
          </Container>
        );
      }}
    </Observer>
  );
});

const Container = styled.div`
  background-color: #eee;
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  top: 0;
  overflow: auto;
`;
