export class ActionResult {
    constructor(action, success) {
        this.action = action;
        this.success = success;
    }
}

export class Action {
    constructor(entity) {
        this.entityRef = entity;
    }

    getEngine() {
        return this.entityRef.gameMap.engineRef;
    }

    getGameMap() {
        return this.entityRef.gameMap;
    }

    perform() {
        console.err("Not Implemented");
    }
}

export class WaitAction extends Action {
    constructor(entity) {
        super(entity);
    }
}

export class ActionWithDirection extends Action {
    constructor(entity, dx, dy) {
        super(entity);

        this.dx = dx;
        this.dy = dy;
    }

    _getDestXY() {
        return { x: this.entityRef.x + this.dx, y: this.entityRef.y + this.dy };
    }

    _getBlockingEntity() {
        var destXY = this._getDestXY();
        return this.getGameMap().getBlockingEntityAtLocation(destXY.x, destXY.y);
    }

    perform() {
        console.err("Not Implemented");
    }
}

export class MeleeAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform() {
        var target = this._getBlockingEntity();
        var success = false;
        if (target) {
            console.log("You kick the " + this.target.name + ", much to its annoyance!");
            success = true;
        }

        return new ActionResult(this, success);
    }
}

export class MovementAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform() {
        var success = false;
        var destXY = this._getDestXY();
        var destX = destXY.x;
        var destY = destXY.y;
        if (this.getGameMap().locations[destX][destY].isTileWalkable() && !this._getBlockingEntity()) {
            this.entityRef.move(this.getEngine(), this.dx, this.dy);

            success = true;
        }

        return new ActionResult(this, success);
    }
}

export class OpenAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform() {
        var success = false;
        var destXY = this._getDestXY();
        var destX = destXY.x;
        var destY = destXY.y;

        var success = this.getGameMap().locations[destX][destY].tileComponentRun("openable", "open");

        return new ActionResult(this, success);
    }
}

export class BumpAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform() {
        var destXY = this._getDestXY();
        var destX = destXY.x;
        var destY = destXY.y;

        var tiles = this.getGameMap().locations[destX][destY].tiles;
        var target = this._getBlockingEntity(destX, destY);
        if (target) {
            return new MeleeAction(this.entityRef, this.dx, this.dy, target).perform();
        } else if (_isClosedOpenable(tiles)) {
            return new OpenAction(this.entityRef, this.dx, this.dy).perform();
        } else {
            return new MovementAction(this.entityRef, this.dx, this.dy).perform();
        }
    }
}

function _isClosedOpenable(tiles) {
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        if (tile.openable && !tile.openable.isOpen) {
            return true;
        }
    }

    return false;
}

export class WarpAction extends Action {
    constructor(entity, x, y) {
        super(entity);
        this.x = x;
        this.y = y;
    }

    perform() {
        var success = false;

        if (this.getGameMap().locations[destX][destY].isTileWalkable()) {
            entity.moveTo(this.getEngine(), this.x, this.x);

            success = true;
        }

        return success;
    }
}
