import { ItemAction } from '../actions';
import { Actor } from '../entity';
import { SingleRangedAttackHandler, AreaRangedAttackHandler, SelectDirectionHandler } from '../eventHandler';
import BaseComponent from './baseComponent';
import Inventory from './inventory';
import { ConfusedEnemy } from './ai';

export class Consumable extends BaseComponent {
    constructor(entity) {
        super(entity);
    }

    getAction(actor, inventorySlot) {
        return new ItemAction(actor, inventorySlot);
    }

    activate(action, doAction) {
        console.error("Not Implemented");
        return false;
    }

    consume(doAction) {
        var entity = this.parent;
        var inventory = entity.parent;
        if (inventory instanceof Inventory) {
            if (doAction) {
                inventory.remove(entity);
            }
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

    activate(action, doAction) {
        var consumer = action.entityRef;
        var amountRecovered = consumer.fighter.heal(this.amount);
        var messageLog = this.getEngine().ui.messageLog;
        if (amountRecovered > 0) {
            if (doAction) {
                messageLog.text("You " + this.activateWord + " the " + this.parent.name + ", and recover " + amountRecovered + " HP!").build();
            }
            return this.consume(doAction);
        } else {
            messageLog.text("Your health is already full.").build();
        }

        return false;
    }
}

export class ResurrectionConsumable extends Consumable {
    constructor(entity) {
        super(entity);
    }

    getAction(actor, inventorySlot) {
        var consumer = this.getEngine().player;
        this.getEngine().ui.messageLog.text("Select a target location.").build();
        this.getEngine().ui.inventoryMenu.hide();

        var targets = [];
        var entities = this.getGameMap().entities;
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            if (entity instanceof Actor && !entity.isAlive() && consumer.distanceTo(entity) == 1) {
                targets.push({"x": entity.x, "y": entity.y});
            }
        }

        this.getEngine().eventHandler = new SelectDirectionHandler(this.getEngine().scene.input, this.getEngine(), targets, function(dx, dy, x, y) {
            return new ItemAction(actor, inventorySlot, {"x": x, "y": y});
        });

        return null;
    }

    activate(action, doAction) {
        var consumer = action.entityRef;
        var destXY = action.targetXY;
        var target = this.getGameMap().getPriorityDeadActorAtLocation(destXY.x, destXY.y);
        var messageLog = this.getEngine().ui.messageLog;
        if (!target || target.isAlive()) {
            messageLog.text("You must select a corpse to revive.").build();
        } else if (!this.getGameMap().shroud[target.x][target.y].visible) {
            messageLog.text("You cannot target an area that you cannot see.").build();
        } else {
            if (doAction) {
                messageLog.text(target.name, "#" + target.sprite.color).text(" is looking a bit more lively!").build();
                target.fighter.revive();
            }
            return this.consume(doAction);
        }

        return false;
    }
}

export class LaserDamageConsumable extends Consumable {
    constructor(entity, damage, maxRange) {
        super(entity);
        this.damage = damage;
        this.maxRange = maxRange;
    }

    activate(action, doAction) {
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

        var messageLog = this.getEngine().ui.messageLog;
        if (target) {
            if (doAction) {
                messageLog.text("A laser strikes ").text(target.name, "#" + target.sprite.color).text(", for ").text(this.damage, "#660000").text(" damage!").build();
                target.fighter.takeDamage(this.damage);
            }
            return this.consume(doAction);
        } else {
            messageLog.text("No enemy is close enough to strike.").build();
        }

        return false;
    }
}

export class ConfusionConsumable extends Consumable {
    constructor(entity, numTurns) {
        super(entity);
        this.numTurns = numTurns;
    }

    getAction(actor, inventorySlot) {
        this.getEngine().ui.messageLog.text("Select a target location.").build();

        this.getEngine().ui.inventoryMenu.hide();
        this.getEngine().eventHandler = new SingleRangedAttackHandler(this.getEngine().scene.input, this.getEngine(), function(x, y) {
            return new ItemAction(actor, inventorySlot, {"x": x, "y": y});
        });

        return null;
    }

    activate(action, doAction) {
        var consumer = action.entityRef;
        var target = action.getTargetActor();
        var messageLog = this.getEngine().ui.messageLog;
        if (!target) {
            messageLog.text("You must select an enemy to target.").build();
        } else if (!this.getGameMap().shroud[target.x][target.y].visible) {
            messageLog.text("You cannot target an area that you cannot see.").build();
        } else if (target === consumer) {
            messageLog.text("You cannot confuse yourself.").build();
        } else {
            if (doAction) {
                messageLog.text("The eyes of the ").text(target.name, "#" + target.sprite.color).text(" look vacant, as it starts to stumble around!").build();
                target.ai = new ConfusedEnemy(target, target.ai, this.numTurns);
            }
            return this.consume(doAction);
        }

        return false;
    }
}

export class GrenadeDamageConsumable extends Consumable {
    constructor(entity, damage, radius) {
        super(entity);
        this.damage = damage;
        this.radius = radius;
    }

    getAction(actor, inventorySlot) {
        this.getEngine().ui.messageLog.text("Select a target location.").build();

        this.getEngine().ui.inventoryMenu.hide();
        this.getEngine().eventHandler = new AreaRangedAttackHandler(this.getEngine().scene.input, this.getEngine(), this.radius, function(x, y) {
            return new ItemAction(actor, inventorySlot, {"x": x, "y": y});
        });

        return null;
    }

    activate(action, doAction) {
        var consumer = action.entityRef;
        var targetXY = action.targetXY;
        var messageLog = this.getEngine().ui.messageLog;
        if (!this.getGameMap().shroud[targetXY.x][targetXY.y].visible) {
            messageLog.text("You cannot target an area that you cannot see.").build();
        } else {
            var targetsHit = false;
            var actors = this.getGameMap().getActors();
            for (var i = 0; i < actors.length; i++) {
                var actor = actors[i];
                if (actor.distance(targetXY.x, targetXY.y) < this.radius) {
                    if (doAction) {
                        messageLog.text("The ").text(actor.name, "#" + actor.sprite.color).text(" is hit with a flurry of shrapnel, taking " + this.damage + " damage!").build();
                        actor.fighter.takeDamage(this.damage);
                    }
                    targetsHit = true;
                }
            }

            if (targetsHit) {
                return this.consume(doAction);
            } else {
                messageLog.text("There are no targets in the radius.").build();
            }

            return false;
        }
    }
}