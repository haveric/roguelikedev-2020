export class ActionResult {
    constructor(action, success, useEnergy) {
        this.action = action;
        this.success = success;
        this.useEnergy = useEnergy;
        if (this.useEnergy === undefined) {
            this.useEnergy = success;
        }
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

    isCurrentPlayer() {
        return this.entityRef === this.getEngine().player;
    }

    perform(/*doAction*/) {
        console.error("Not Implemented");
    }
}

export class DebugAction extends Action {
    constructor(entity) {
        super(entity);
    }

    perform(doAction) {
        if (doAction) {
            this.getEngine().player.fighter.revive();
            this.getEngine().clearFov();
        }

        return new ActionResult(this, true, false);
    }

    toString() {
        return { action: "DebugAction" };
    }
}

export class WaitAction extends Action {
    constructor(entity) {
        super(entity);
    }

    perform(/*doAction*/) {
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
        const destXY = this._getDestXY();
        return this.getGameMap().getBlockingEntityAtLocation(destXY.x, destXY.y);
    }

    getTargetActor() {
        const destXY = this._getDestXY();
        return this.getGameMap().getActorAtLocation(destXY.x, destXY.y);
    }

    perform(/*doAction*/) {
        console.error("Not Implemented");
    }
}

export class MeleeAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform(doAction) {
        const target = this.getTargetActor();
        let success;
        const messageLog = this.getEngine().ui.messageLog;
        if (target) {
            if (doAction) {
                const damage = this.entityRef.fighter.power - target.fighter.defense;
                messageLog.text(this.entityRef.name, "#" + this.entityRef.sprite.color).text(" attacks ").text(target.name, "#" + target.sprite.color);

                if (damage > 0) {
                    messageLog.text(" for " + damage + " hit points.").build();
                    target.fighter.takeDamage(damage);
                } else {
                    messageLog.text(" but does no damage.").build();
                }
            }
            success = true;
        } else {
            messageLog.text("Nothing to attack.").build();
            success = false;
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
        let success;
        const destXY = this._getDestXY();
        const destX = destXY.x;
        const destY = destXY.y;
        const messageLog = this.getEngine().ui.messageLog;
        if (!this.getGameMap().locations[destX][destY].isTileWalkable() || this._getBlockingEntity()) {
            if (this.isCurrentPlayer()) {
                messageLog.text("That way is blocked.").build();
            }
            success = false;
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
        const destXY = this._getDestXY();
        const destX = destXY.x;
        const destY = destXY.y;

        const messageLog = this.getEngine().ui.messageLog;
        let success;
        if (doAction) {
            success = this.getGameMap().locations[destX][destY].tileComponentRun("openable", "open");
        } else {
            const check = this.getGameMap().locations[destX][destY].tileComponentCheck("openable", "getIsOpen");

            if (check === null) {
                if (this.isCurrentPlayer()) {
                    messageLog.text("There is nothing there to open.").build();
                }
                success = false;
            } else {
                success = !check;
            }
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "OpenAction", args: { dx: this.dx, dy: this.dy } };
    }
}

export class CloseAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform(doAction) {
        const destXY = this._getDestXY();
        const destX = destXY.x;
        const destY = destXY.y;

        const messageLog = this.getEngine().ui.messageLog;
        let success;
        if (doAction) {
            success = this.getGameMap().locations[destX][destY].tileComponentRun("openable", "close");
        } else {
            success = this.getGameMap().locations[destX][destY].tileComponentCheck("openable", "getIsOpen");

            if (success === null) {
                if (this.isCurrentPlayer()) {
                    messageLog.text("There is nothing there to close.").build();
                }
            } else {
                const blockingEntity = this._getBlockingEntity();

                if (blockingEntity) {
                    messageLog.text(blockingEntity.name, "#" + blockingEntity.sprite.color).text(" is blocking the door.").build();
                    success = false;
                }
            }
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "CloseAction", args: { dx: this.dx, dy: this.dy } };
    }
}

export class BumpAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
        this.friendlyFire = false;
    }

    perform(doAction) {
        const destXY = this._getDestXY();
        const destX = destXY.x;
        const destY = destXY.y;

        const tiles = this.getGameMap().locations[destX][destY].tiles;
        const target = this.getTargetActor();

        let entityIsPlayer = false;
        let targetIsPlayer = false;
        for (let i = 0; i < this.getEngine().players.length; i++) {
            const player = this.getEngine().players[i];
            if (this.entityRef === player) {
                entityIsPlayer = true;
            }

            if (target === player) {
                targetIsPlayer = true;
            }
        }


        if ((this.friendlyFire || entityIsPlayer !== targetIsPlayer) && target) {
            return new MeleeAction(this.entityRef, this.dx, this.dy, target).perform(doAction);
        } else if (this.entityRef.canOpenDoors && _isClosedOpenable(tiles)) {
            return new OpenAction(this.entityRef, this.dx, this.dy).perform(doAction);
        } else {
            return new MovementAction(this.entityRef, this.dx, this.dy).perform(doAction);
        }
    }
}

function _isClosedOpenable(tiles) {
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
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
        let success;

        const messageLog = this.getEngine().ui.messageLog;
        if (this.getGameMap().locations[this.x][this.y].isTileWalkable()) {
            if (doAction) {
                this.entityRef.moveTo(this.getEngine(), this.x, this.x);
            }

            success = true;
        } else {
            if (this.isCurrentPlayer()) {
                messageLog.text("You can't warp there.").build();
            }
            success = false;
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "WarpAction", args: { x: this.x, y: this.y } };
    }
}

export class TakeStairsAction extends Action {
    constructor(entity) {
        super(entity);
    }

    perform(doAction) {
        const actorX = this.entityRef.x;
        const actorY = this.entityRef.y;

        let success;
        if (doAction) {
            this.getGameMap().locations[actorX][actorY].tileComponentRun("stairs", "take");

            success = true;
        } else {
            success = this.getGameMap().locations[actorX][actorY].tileHasComponent("stairs");
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "TakeStairsAction" };
    }
}

export class PickupAction extends Action {
    constructor(entity) {
        super(entity);
    }

    perform(doAction) {
        const actorX = this.entityRef.x;
        const actorY = this.entityRef.y;

        const inventory = this.entityRef.inventory;

        const items = this.getGameMap().getItems();
        const messageLog = this.getEngine().ui.messageLog;
        if (items.length === 0) {
            if (this.isCurrentPlayer()) {
                messageLog.text("There is nothing here to pick up.").build();
            }

            return new ActionResult(this, false);
        } else {
            let success = false;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (actorX === item.x && actorY === item.y) {
                    if (!inventory.canAdd(item)) {
                        if (this.isCurrentPlayer()) {
                            messageLog.text("Your inventory is full.").build();
                        }
                        success = false;
                        break;
                    }

                    const index = this.getGameMap().entities.indexOf(item);
                    if (index !== -1) {
                        if (doAction) {
                            this.getGameMap().entities.splice(index, 1);
                            item.parent = this.entityRef.inventory;
                            item.sprite.destroy();
                            inventory.add(item);

                            let playerString;
                            if (this.isCurrentPlayer()) {
                                playerString = "You";
                            } else {
                                playerString = this.entityRef.name;
                            }
                            messageLog.text(playerString + " picked up the " + item.name + "!").build();
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
    constructor(entity, inventorySlot, targetXY) {
        super(entity);

        this.inventorySlot = inventorySlot;
        this.targetXY = targetXY;
        if (!this.targetXY) {
            this.targetXY = {
                "x": this.entityRef.x,
                "y": this.entityRef.y
            };
        }
    }

    getTargetActor() {
        return this.getGameMap().getActorAtLocation(this.targetXY.x, this.targetXY.y);
    }

    perform(doAction) {
        const item = this.entityRef.inventory.items[this.inventorySlot];
        const success = item.consumable.activate(this, doAction);

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "ItemAction", args: { inventorySlot: this.inventorySlot, targetXY: this.targetXY }};
    }
}

export class DropItemAction extends ItemAction {
    constructor(entity, inventorySlot, targetXY) {
        super(entity, inventorySlot, targetXY);
    }

    perform(doAction) {
        if (doAction) {
            this.entityRef.inventory.dropByIndex(this.inventorySlot);
        }

        return new ActionResult(this, true);
    }

    toString() {
        return { action: "DropItemAction", args: { inventorySlot: this.inventorySlot }};
    }
}