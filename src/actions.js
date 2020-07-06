export class Action {
    perform(engine, entity) {
        console.err("Not Implemented");
    }
}

export class ActionResult {
    constructor(action, success) {
        this.action = action;
        this.success = success;
    }
}

export class ActionWithDirection extends Action {
    constructor(dx, dy) {
        super();

        this.dx = dx;
        this.dy = dy;
    }
}

export class MeleeAction extends ActionWithDirection {
    constructor(dx, dy, target) {
        super(dx, dy);

        this.target = target;
    }

    perform(engine, entity) {
        console.log("You kick the " + this.target.name + ", much to its annoyance!");

        return new ActionResult(this, true);
    }
}

export class MovementAction extends ActionWithDirection {
    constructor(dx, dy) {
        super(dx, dy);
    }

    perform(engine, entity) {
        var success = false;
        var destX = entity.x + this.dx;
        var destY = entity.y + this.dy;

        if (engine.gameMap.locations[destX][destY].isTileWalkable()) {
            entity.move(engine, this.dx, this.dy);

            success = true;
        }

        return new ActionResult(this, success);
    }
}

export class OpenAction extends ActionWithDirection {
    constructor(dx, dy) {
        super(dx, dy);
    }

    perform(engine, entity) {
        var success = false;
        var destX = entity.x + this.dx;
        var destY = entity.y + this.dy;

        var success = engine.gameMap.locations[destX][destY].tileComponentRun("openable", "open");

        return new ActionResult(this, success);
    }
}

export class BumpAction extends ActionWithDirection {
    constructor(dx, dy) {
        super(dx, dy);
    }

    perform(engine, entity) {
        var destX = entity.x + this.dx;
        var destY = entity.y + this.dy;

        var tiles = engine.gameMap.locations[destX][destY].tiles;
        var target = engine.gameMap.getBlockingEntityAtLocation(destX, destY);
        if (target) {
            return new MeleeAction(this.dx, this.dy, target).perform(engine, entity);
        } else if (_isClosedOpenable(tiles)) {
            return new OpenAction(this.dx, this.dy).perform(engine, entity);
        } else {
            return new MovementAction(this.dx, this.dy).perform(engine, entity);
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
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    perform(engine, entity) {
        var success = false;

        if (engine.gameMap.locations[destX][destY].isTileWalkable()) {
            entity.moveTo(engine, this.x, this.x);

            success = true;
        }

        return success;
    }
}
