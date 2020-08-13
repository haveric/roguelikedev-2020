import ActionWithDirection from "./_actionWithDirection";
import ActionResult from "../actionResult";

export default class MeleeAction extends ActionWithDirection {
    constructor(entity, dx, dy) {
        super(entity, dx, dy);
    }

    perform(doAction) {
        const target = this.getTargetActor();
        let success;
        const messageLog = this.getEngine().ui.messageLog;
        if (target) {
            if (doAction) {
                const damage = this.entityRef.fighter.getPower() - target.fighter.getDefense();
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