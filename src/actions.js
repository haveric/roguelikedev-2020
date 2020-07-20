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
        return this.entityRef.getGameMap().engineRef;
    }

    getGameMap() {
        return this.entityRef.getGameMap();
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
                this.getEngine().messageLog.text(this.entityRef.name, "#" + this.entityRef.sprite.color).text(" attacks ").text(target.name, "#" + target.sprite.color);
                var attackDesc = this.entityRef.name + " attacks " + target.name;

                if (damage > 0) {
                    this.getEngine().messageLog.text(" for " + damage + " hit points.").build();
                    target.fighter.takeDamage(damage);
                } else {
                    this.getEngine().messageLog.text(" but does no damage.").build();
                }
            }
            success = true;
        } else {
            this.getEngine().messageLog.text("Nothing to attack.").build();
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
        if (!this.getGameMap().locations[destX][destY].isTileWalkable() || this._getBlockingEntity()) {
            this.getEngine().messageLog.text("That way is blocked.").build();
        } else {
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

export class PickupAction extends Action {
    constructor(entity, actor) {
        super(entity);
        this.actor = actor;
    }

    perform(doAction) {
        var actorX = this.entityRef.x;
        var actorY = this.entityRef.y;

        var inventory = this.entityRef.inventory;

        var isCurrentPlayer = this.entityRef == this.getEngine().player;

        var items = this.getGameMap().getItems();
        if (items.length == 0) {
            if (isCurrentPlayer) {
                this.getEngine().messageLog.text("There is nothing here to pick up.").build();
            }
            return new ActionResult(this, false);
        } else {
            var success = false;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (actorX == item.x && actorY == item.y) {
                    if (inventory.items.length >= inventory.capacity) {
                        if (isCurrentPlayer) {
                            this.getEngine().messageLog.text("Your inventory is full.").build();
                        }
                        break;
                    }

                    var index = this.getGameMap().entities.indexOf(item);
                    if (index != -1) {
                        if (doAction) {
                            this.getGameMap().entities.splice(index, 1);
                            item.parent = inventory;
                            item.sprite.destroy();
                            inventory.items.push(item);

                            var playerString;
                            if (isCurrentPlayer) {
                                playerString = "You";
                            } else {
                                playerString = this.entityRef.name;
                            }
                            this.getEngine().messageLog.text(playerString + " picked up the " + item.name + "!").build();
                        }

                        success = true;
                    }
                }
            }

            return new ActionResult(this, success);
        }
    }

    toString() {
        return { action: "PickupAction" };
    }
}

export class ItemAction extends Action {
    constructor(entity, item) {
        super(entity);

        this.item = item;
    }

    perform(doAction) { }
}

export class ConsumeAction extends ItemAction {
    constructor(entity) {
        super(entity);
    }

    perform(doAction) {
        this.item.consumable.consume(this.entityRef);
        this.entityRef.inventory.remove(this.item);
    }

    toString() {
        return { action: "ConsumeAction" };
    }
}

export class DropAction extends ItemAction {
    constructor(entity) {
        super(entity);
    }

    perform(doAction) {
        this.entityRef.inventory.drop(this.item);
    }

    toString() {
        return { action: "DropAction" };
    }
}