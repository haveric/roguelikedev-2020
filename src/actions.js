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

    perform(doAction) {
        console.err("Not Implemented");
    }
}

export class WaitAction extends Action {
    constructor(entity) {
        super(entity);
    }

    perform(doAction) {
        return new ActionResult(this, true);
    }

    toString() {
        return { action: "WaitAction" };
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

    _targetActor() {
        var destXY = this._getDestXY();
        return this.getGameMap().getActorAtLocation(destXY.x, destXY.y);
    }

    perform(doAction) {
        console.err("Not Implemented");
    }
}

export class MeleeAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform(doAction) {
        var target = this._targetActor();
        var success = false;
        if (target) {
            if (doAction) {
                var damage = this.entityRef.fighter.power - target.fighter.defense;
                var attackDesc = this.entityRef.name + " attacks " + target.name;

                if (damage > 0) {
                    console.log(attackDesc + " for " + damage + " hit points.");
                    target.fighter.takeDamage(damage);
                } else {
                    console.log(attackDesc + " but does no damage.");
                }
            }
            success = true;
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "MeleeAction", args: { dx: this.dx, dy: this.dy } };
    }
}

export class MovementAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform(doAction) {
        var success = false;
        var destXY = this._getDestXY();
        var destX = destXY.x;
        var destY = destXY.y;
        if (this.getGameMap().locations[destX][destY].isTileWalkable() && !this._getBlockingEntity()) {
            if (doAction) {
                this.entityRef.move(this.getEngine(), this.dx, this.dy);
            }

            success = true;
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "MovementAction", args: { dx: this.dx, dy: this.dy } };
    }
}

export class OpenAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform(doAction) {
        var success = false;
        var destXY = this._getDestXY();
        var destX = destXY.x;
        var destY = destXY.y;

        var success;
        if (doAction) {
            success = this.getGameMap().locations[destX][destY].tileComponentRun("openable", "open");
        } else {
            success = !this.getGameMap().locations[destX][destY].tileComponentCheck("openable", "getIsOpen");
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "OpenAction", args: { dx: this.dx, dy: this.dy } };
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
        var target = this._targetActor(destX, destY);
        if (target) {
            return new MeleeAction(this.entityRef, this.dx, this.dy, target).perform(false);
        } else if (_isClosedOpenable(tiles)) {
            return new OpenAction(this.entityRef, this.dx, this.dy).perform(false);
        } else {
            return new MovementAction(this.entityRef, this.dx, this.dy).perform(false);
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

    perform(doAction) {
        var success = false;

        if (this.getGameMap().locations[this.x][this.y].isTileWalkable()) {
            if (doAction) {
                this.entityRef.moveTo(this.getEngine(), this.x, this.x);
            }

            success = true;
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "WarpAction", args: { x: this.x, y: this.y } };
    }
}
