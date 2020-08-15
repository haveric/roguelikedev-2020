export default class BaseComponent {
    constructor(entity) {
        this.parent = entity;
    }

    getGameMap() {
        return this.parent.getGameMap();
    }

    getEngine() {
        return this.parent.getGameMap().engineRef;
    }
}