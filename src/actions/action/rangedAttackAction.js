import Action from "./_action";
import ActionResult from "../actionResult";

export default class RangedAttackAction extends Action {
    constructor(entity, x, y) {
        super(entity);
        this.x = x;
        this.y = y;
    }

    perform(doAction) {
        const target = this.getTargetActor();
        let success;
        const messageLog = this.getEngine().ui.messageLog;
        if (target) {
            if (doAction) {
                const damage = this.entityRef.fighter.getPower() - target.fighter.getDefense();
                messageLog.text(this.entityRef.name, "#" + this.entityRef.sprite.color).text(" shoots at ").text(target.name, "#" + target.sprite.color);

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
        return { action: "RangedAttackAction", args: { x: this.x, y: this.y } };
    }

    getTargetActor() {
        return this.getGameMap().getActorAtLocation(this.x, this.y);
    }
}