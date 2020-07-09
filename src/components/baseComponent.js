export default class BaseComponent {
    constructor(entity) {
        this.entityRef = entity;
    }

    getEngine() {
        return this.entityRef.gameMap.engineRef;
    }
}