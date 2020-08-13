import Action from "./_action";
import ActionResult from "../actionResult";

export default class WaitAction extends Action {
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