import ActionWithDirection from "./_actionWithDirection";
import MeleeAction from "./meleeAction";
import OpenAction from "./openAction";
import MovementAction from "./movementAction";

export default class BumpAction extends ActionWithDirection {
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

        const entityIsPlayer = this.getEngine().isEntityAPlayer(this.entityRef);
        const targetIsPlayer = this.getEngine().isEntityAPlayer(target);

        if ((this.friendlyFire || entityIsPlayer !== targetIsPlayer) && target) {
            return new MeleeAction(this.entityRef, this.dx, this.dy, target).perform(doAction);
        } else if (this.entityRef.canOpenDoors && this._isClosedOpenable(tiles)) {
            return new OpenAction(this.entityRef, this.dx, this.dy).perform(doAction);
        } else {
            return new MovementAction(this.entityRef, this.dx, this.dy).perform(doAction);
        }
    }

    _isClosedOpenable(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            if (tile.openable && !tile.openable.isOpen) {
                return true;
            }
        }

        return false;
    }
}
