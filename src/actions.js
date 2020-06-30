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
        var destX = entity.x + this.dx;
        var destY = entity.y + this.dy;

        if (engine.gameMap.tiles[destX][destY].walkable) {
            entity.move(engine, this.dx, this.dy);
        }
    }
}


exports.Action = Action;
exports.MovementAction = MovementAction;