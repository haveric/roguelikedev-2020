import Action from "./_action";
import ActionResult from "../actionResult";

export default class DebugAction extends Action {
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