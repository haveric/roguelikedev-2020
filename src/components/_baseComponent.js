import GameMap from "../gameMap"; // eslint-disable-line no-unused-vars

export default class BaseComponent {
    constructor(entity) {
        this.parent = entity;
    }

    /**
     * @returns {GameMap} gameMap
     */
    getGameMap() {
        return this.parent.getGameMap();
    }

    getEngine() {
        return this.parent.getGameMap().engineRef;
    }
}