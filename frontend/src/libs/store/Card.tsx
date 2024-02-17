import assert from "assert";

import { observable, action } from "mobx";

class Card {
    @observable title = "";
    @observable cardId = null;

    constructor(title, cardId) {
        this.title = title;
        this.cardId = cardId;
        assert(title);
        assert(cardId);
    }

    @action setTitle(title) {
        this.title = title;
    }
}

export default Card;
