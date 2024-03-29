import PortalModel, { PortalParam } from "store/Portal";
import DeckModel, { DeckParam } from "store/Deck";
import { observable, runInAction } from "mobx";
import { useHistory } from "react-router-dom";
import BoardModel from "store/Board";
import Store from "store";
import api from "api";

type Options = {
    store: Store,
    boardId: string,
    history: ReturnType<typeof useHistory>,
    setLoading: (loading: boolean) => void,
}

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
                if (child.type === "deck")
                    return new DeckModel(child as DeckParam);
                if (child.type === "portal")
                    return new PortalModel({
                        ...(child as PortalParam),
                        target: new DeckModel(
                            (child as PortalModel).target as DeckParam,
                        ),
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
