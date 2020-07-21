import { ItemAction } from '../actions';
import BaseComponent from './baseComponent';
import Inventory from './inventory';

export class Consumable extends BaseComponent {
    constructor(entity) {
        super(entity);
    }

    getAction(actor, inventorySlot) {
        return new ItemAction(actor, inventorySlot);
    }

    activate(action) {
        console.error("Not Implemented");
        return false;
    }

    consume() {
        var entity = this.parent;
        var inventory = entity.parent;
        if (inventory instanceof Inventory) {
            inventory.remove(entity);
            return true;
        }

        return false;
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
            this.consume();
        } else {
            this.getEngine().messageLog.text("Your health is already full.").build();
        }
    }
}

export class LaserDamageConsumable extends Consumable {
    constructor(entity, damage, maxRange) {
        super(entity);
        this.damage = damage;
        this.maxRange = maxRange;
    }

    activate(action) {
        var consumer = action.entityRef;
        var target = null;
        var closestDistance = this.maxRange + 1;

        var actors = this.getGameMap().getActors();
        for (var i = 0; i < actors.length; i++) {
            var actor = actors[i];
            if (actor !== consumer && this.getGameMap().shroud[actor.x][actor.y].visible) {
                var distance = consumer.distanceTo(actor);

                if (distance < closestDistance) {
                    target = actor;
                    closestDistance = distance;
                }
            }
        }

        if (target) {
            this.getEngine().messageLog.text("A laser strikes ").text(target.name, "#" + target.sprite.color).text(", for ").text(this.damage, "#660000").text(" damage!").build();
            target.fighter.takeDamage(this.damage);
            this.consume();
        } else {
            this.getEngine().messageLog.text("No enemy is close enough to strike.").build();
        }
    }
}