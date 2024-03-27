import { observable, action } from "mobx";

class Card {
    @observable title = "";
    @observable cardId = null;
    @observable.ref images: string[] = [];

    constructor(title: string, cardId: string, images: string[]) {
        if (!title) throw Error("Card title is required");
        if (!cardId) throw Error("Card id is required");
        this.title = title;
        this.cardId = cardId;
        this.images = images;
    }

    @action setTitle(title: string) {
        this.title = title;
    }
}

export default Card;
