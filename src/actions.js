class Action {
    perform(engine, entity) {
        console.err("Not Implemented");
    }
}

class MovementAction extends Action {
    constructor(dx, dy) {
        super();

        this.dx = dx;
        this.dy = dy;
    }

    perform(engine, entity) {
        var success = false;
        var destX = entity.x + this.dx;
        var destY = entity.y + this.dy;

        var floorTile = engine.gameMap.floorTiles[destX][destY];
        var wallTile = engine.gameMap.wallTiles[destX][destY];
        if (floorTile.walkable && (!wallTile || wallTile.walkable)) {
            entity.move(engine, this.dx, this.dy);

            success = true;
        }

        return success;
    }
}


exports.Action = Action;
exports.MovementAction = MovementAction;