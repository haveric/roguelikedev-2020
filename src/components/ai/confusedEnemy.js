import {BaseAI} from "./_baseAi";
import Srand from "seeded-rand";
import BumpAction from "../../actions/actionWithDirection/bumpAction";

export class ConfusedEnemy extends BaseAI {
    constructor(entity, previousAI, turnsRemaining) {
        super(entity);

        this.previousAI = previousAI;
        this.turnsRemaining = turnsRemaining;
    }

    perform() {
        if (this.turnsRemaining <= 0) {
            this.getEngine().ui.messageLog.text("The ").text(this.parent.name, "#" + this.parent.sprite.color).text(" is no longer confused.").build();
            this.parent.ai = this.previousAI;
        } else {
            let x;
            let y;
            const choice = Srand.intInRange(1, 8);
            switch(choice) {
                case 1:
                    x = -1; y = -1;
                    break;
                case 2:
                    x = 0; y = -1;
                    break;
                case 3:
                    x = 1; y = -1;
                    break;
                case 4:
                    x = -1; y = 0;
                    break;
                case 5:
                    x = 1; y = 0;
                    break;
                case 6:
                    x = -1; y = 1;
                    break;
                case 7:
                    x = 0; y = 1;
                    break;
                case 8:
                default:
                    x = 1; y = 1;
                    break;
            }

            this.turnsRemaining -= 1;
            return new BumpAction(this.parent, x, y).perform(true);
        }
    }
}