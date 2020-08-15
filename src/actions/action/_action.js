export default class Action {
    constructor(entity) {
        this.entityRef = entity;
    }

    getEngine() {
        return this.entityRef.getGameMap().engineRef;
    }

    getGameMap() {
        return this.entityRef.getGameMap();
    }

    isCurrentPlayer() {
        return this.entityRef === this.getEngine().player;
    }

    perform(/*doAction*/) {
        console.error("Not Implemented");
    }
}