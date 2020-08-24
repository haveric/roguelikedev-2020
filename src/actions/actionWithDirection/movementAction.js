import ActionWithDirection from "./_actionWithDirection";
import ActionResult from "../actionResult";

export default class MovementAction extends ActionWithDirection {
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
            if (this.isCurrentPlayer()) {
                const footstep = this.getEngine().scene.sound.add("footstep");
                footstep.play();
            }
            success = true;
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "MovementAction", args: { dx: this.dx, dy: this.dy } };
    }
}