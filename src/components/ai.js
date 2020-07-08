import BaseComponent from './baseComponent';

export class BaseAI extends BaseComponent {
    constructor(entity) {
        super(entity);
    }

    perform() {}

    getPathTo(destX, destY) {
        // TODO: Implement
    }
}

export class HostileEnemy extends BaseAI {
    constructor(entity) {
        super(entity);
        this.path = [];
    }

    perform() {
        // TODO: Implement
    }
}