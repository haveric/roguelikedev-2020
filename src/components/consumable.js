import { ItemAction } from '../actions';
import BaseComponent from './baseComponent';

export class Consumable extends BaseComponent {
    constructor(entity) {
        super(entity);
    }

    getAction(actor, inventorySlot) {
        return new ItemAction(actor, inventorySlot);
    }

    activate(action) {
        console.error("Not Implemented");
    }
}

export class HealingConsumable extends Consumable {
    constructor(entity, amount, activateWord="consume") {
        super(entity);

        this.amount = amount;
        this.activateWord = activateWord;
    }

    activate(action) {
        var consumer = action.entityRef;
        var amountRecovered = consumer.fighter.heal(this.amount);

        if (amountRecovered > 0) {
            this.getEngine().messageLog.text("You " + this.activateWord + " the " + this.parent.name + ", and recover " + amountRecovered + " HP!").build();
        } else {
            this.getEngine().messageLog.text("Your health is already full.").build();
        }
    }
}