import Action from "./_action";
import ActionResult from "../actionResult";

export default class WarpAction extends Action {
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