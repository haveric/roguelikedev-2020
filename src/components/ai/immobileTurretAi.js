import {BaseAI} from "./_baseAi";
import Srand from "seeded-rand";
import {MeleeAction, WaitAction} from "../../actions";

export class ImmobileTurretAi extends BaseAI {
    constructor(entity) {
        super(entity);
        this.path = [];
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
                if (closestDistance <= 1) {
                    return new MeleeAction(this.parent, closestPlayer.x - this.parent.x, closestPlayer.y - this.parent.y).perform(true);
                }

                this.path = this.getPathTo(closestPlayer.x, closestPlayer.y);
            }

        }

        return new WaitAction(this.parent).perform(true);
    }
}
