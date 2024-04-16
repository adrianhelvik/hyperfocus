import PortalModel, { PortalParam } from "src/libs/store/Portal";
import DeckModel, { DeckParam } from "src/libs/store/Deck";
import { useHistory } from "react-router-dom";
import BoardModel from "src/libs/store/Board";
import { runInAction } from "mobx";
import Store from "src/libs/store";
import api from "src/libs/api";

type Options = {
  store: Store;
  boardId: string;
  history: ReturnType<typeof useHistory>;
  setLoading: (loading: boolean) => void;
};

export default async function loadBoard(options: Options) {
  try {
    var { boardId, color, title, children } = await api.getBoard({
      boardId: options.boardId,
    });
  } catch (e) {
    alert(e.message);
    options.history.push("/app");
    return;
  }

  runInAction(() => {
    const board = new BoardModel({
      children: children.map((child) => {
        if (child.type === "deck") return new DeckModel(child as DeckParam);
        if (child.type === "portal")
          return new PortalModel({
            ...(child as PortalParam),
            target: new DeckModel((child as PortalModel).target as DeckParam),
          });
        throw Error("Invalid child type");
      }),
      boardId,
      title,
      color,
    });

    options.store.setActiveBoard(new BoardModel(board));

    options.setLoading(false);
  });
}
