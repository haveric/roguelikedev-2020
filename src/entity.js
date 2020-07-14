import Tilemaps from './tilemaps';
import RenderOrder from './renderOrder';

export default class Entity {
    constructor(x, y, name, description, sprite, blocksMovement, renderOrder) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.description = description;
        this.blocksMovement = blocksMovement;
        this.renderOrder = renderOrder;
        this.lightRadius = 8;
        this.gameMap = null;

        this.setSprite(sprite);

        // Components
        this.fighter = null;
        this.ai = null;
    }

    setSprite(sprite) {
        if (sprite) {
            this.sprite = sprite;
            this.sprite.owner = this;
        }
    }

    setFighter(fighter) {
        if (fighter) {
            this.fighter = fighter;
            this.fighter.owner = this;
        }
    }

    setAI(ai) {
        if (ai) {
            this.ai = ai;
            this.ai.owner = this;
        }
    }

    setConsumable(consumable) {
        if (consumable) {
            this.consumable = consumable;
            this.consumable.owner = this;
        }
    }

    setInventory(inventory) {
        if (inventory) {
            this.inventory = inventory;
            this.inventory.owner = this;
        }
    }

    move(engine, dx, dy) {
        this.x += dx;
        this.y += dy;

        this.sprite.move(dx * Tilemaps.getTileMap().frameWidth, dy * Tilemaps.getTileMap().frameHeight);
    }

    moveTo(engine, x, y) {
        this.x = x;
        this.y = y;

        this.sprite.moveTo(engine.gameMap.offsetWidth + (x * Tilemaps.getTileMap().frameWidth), engine.gameMap.offsetHeight + (y * Tilemaps.getTileMap().frameHeight));
    }

    moveTowards(engine, targetX, targetY) {

    }

    distanceTo(otherEntity) {
        var dx = otherEntity.x - this.x;
        var dy = otherEntity.y - this.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    place(gameMap, x, y) {
        if (this.gameMap) {
            this.gameMap.remove(this);
        }

        if (x !== undefined) {
            this.x = x;
        }

        if (y !== undefined) {
            this.y = y;
        }

        this.gameMap = gameMap;
        gameMap.entities.push(this);
    }
}

export class Actor extends Entity {
    constructor(x, y, name, description, sprite) {
        super(x, y, name, description, sprite, true, RenderOrder.ACTOR);
    }

    isAlive() {
        return this.ai != null;
    }
}

export class Item extends Entity {
    constructor(x, y, name, description, sprite) {
        super(x, y, name, description, sprite, false, RenderOrder.ITEM);
    }
}