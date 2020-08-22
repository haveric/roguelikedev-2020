import {BaseAI} from "./_baseAi";
import Srand from "seeded-rand";
import {RangedAttackAction, WaitAction} from "../../actions";

export class ImmobileTurretAi extends BaseAI {
    constructor(entity) {
        super(entity);

        // TEMPORARY - fighter needs range or something
        this.range = 2;
    }

    perform() {
        const players = this.getEngine().players;

        let closestPlayer;
        let closestDistance = null;
        for (let i = 0; i < players.length; i++) {
            const target = players[i];
            if (target.isAlive()) {
                const dx = target.x - this.parent.x;
                const dy = target.y - this.parent.y;

                const distance = Math.max(Math.abs(dx), Math.abs(dy));
                if (closestDistance === null || distance < closestDistance || (distance === closestDistance && Srand.intInRange(0,1) === 0)) {
                    closestPlayer = target;
                    closestDistance = distance;
                }
            }
        }

        // Only take action if a player exists
        if (closestPlayer) {
            if (this.getGameMap().getShroud()[this.parent.x][this.parent.y].visible) {
                if (closestDistance <= this.range) {
                    return new RangedAttackAction(this.parent, closestPlayer.x, closestPlayer.y).perform(true);
                }
            }

        }

        return new WaitAction(this.parent).perform(true);
    }
}
