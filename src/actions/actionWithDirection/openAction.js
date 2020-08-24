import ActionWithDirection from "./_actionWithDirection";
import ActionResult from "../actionResult";

export default class OpenAction extends ActionWithDirection {
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
            if (this.isCurrentPlayer()) {
                const open = this.getEngine().scene.sound.add("open-close");
                open.play();
            }
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