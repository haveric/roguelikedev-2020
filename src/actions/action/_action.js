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

    /**
     * @param {boolean} doAction - Boolean that represents whether action should be performed, or if it's just a check.
     */
    perform(/*doAction*/) {
        console.error("Not Implemented");
    }
}