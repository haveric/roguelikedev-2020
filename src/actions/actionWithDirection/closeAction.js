import ActionWithDirection from "./_actionWithDirection";
import ActionResult from "../actionResult";

export default class CloseAction extends ActionWithDirection {
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