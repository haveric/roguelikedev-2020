import {BaseAI} from "./_baseAi";
import Srand from "seeded-rand";
import MeleeAction from "../../actions/actionWithDirection/meleeAction";
import BumpAction from "../../actions/actionWithDirection/bumpAction";
import WaitAction from "../../actions/action/waitAction";

export class MeleeChaseEnemy extends BaseAI {
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
            if (this.getGameMap().shroud[this.parent.x][this.parent.y].visible) {
                if (closestDistance <= 1) {
                    return new MeleeAction(this.parent, closestPlayer.x - this.parent.x, closestPlayer.y - this.parent.y).perform(true);
                }

                this.path = this.getPathTo(closestPlayer.x, closestPlayer.y);
            }

            if (this.path.length > 0) {
                const next = this.path.shift();

                const resultAction = new BumpAction(this.parent, next.x - this.parent.x, next.y - this.parent.y).perform(true);
                if (!resultAction.success) {
                    this.path.unshift(next);
                }

                return resultAction;
            }
        }

        return new WaitAction(this.parent).perform(true);
    }
}