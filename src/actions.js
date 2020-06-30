export class Action {
    perform(engine, entity) {
        console.err("Not Implemented");
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

        return true;
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

        var floorTile = engine.gameMap.floorTiles[destX][destY];
        var wallTile = engine.gameMap.wallTiles[destX][destY];
        if (floorTile && floorTile.walkable && (!wallTile || wallTile.walkable)) {
            entity.move(engine, this.dx, this.dy);

            success = true;
        }

        return success;
    }
}

export class BumpAction extends ActionWithDirection {
    constructor(dx, dy) {
        super(dx, dy);
    }

    perform(engine, entity) {
        var destX = entity.x + this.dx;
        var destY = entity.y + this.dy;

        var target = engine.gameMap.getBlockingEntityAtLocation(destX, destY);

        if (target) {
            return new MeleeAction(this.dx, this.dy, target).perform(engine, entity);
        } else {
            return new MovementAction(this.dx, this.dy).perform(engine, entity);
        }
    }
}