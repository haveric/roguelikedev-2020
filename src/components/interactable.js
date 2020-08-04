import BaseComponent from "./baseComponent";

export default class Interactable extends BaseComponent {
    constructor(entity, allPlayersRequired=false) {
        super(entity);

        this.allPlayersRequired = allPlayersRequired;
    }

    interact() {

    }

    isAllPlayersRequired() {
        return this.allPlayersRequired;
    }
}
