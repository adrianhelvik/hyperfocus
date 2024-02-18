import { observable, action } from "mobx";

class Card {
    @observable title = "";
    @observable cardId = null;

    constructor(title: string, cardId: string) {
        if (!title) throw Error("Card title is required");
        if (!cardId) throw Error("Card id is required");
        this.title = title;
        this.cardId = cardId;
    }

    @action setTitle(title: string) {
        this.title = title;
    }
}

export default Card;
