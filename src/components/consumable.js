import BaseComponent from './baseComponent';

export class Consumable extends BaseComponent {
    constructor(entity) {
        super(entity);
    }

    consume(actor) {
        console.err("Not Implemented");
    }
}

export class HealingConsumable extends Consumable {
    constructor(entity, amount, consumeWord="consume") {
        super(entity);

        this.amount = amount;
        this.consumeWord = consumeWord;
    }

    consume(actor) {
        var amountRecovered = actor.fighter.heal(this.amount);

        if (amountRecovered > 0) {
            this.getEngine().messageLog.text("You " + consumeWord + " the " + this.entityRef.name + ", and recover " + amountRecovered + " HP!").build();
        } else {
            this.getEngine().messageLog.text("Your health is already full.").build();
        }
    }
}