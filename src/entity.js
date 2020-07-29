import Tilemaps from './tilemaps';
import RenderOrder from './renderOrder';
import Sprite from './sprite';


export default class Entity {
    /**
     * An Entity
     * @constructor
     * @param {integer} x - X coordinate of the tile.
     * @param {integer} y - Y coordinate of the tile.
     * @param {string} name - Name of the Entity.
     * @param {object} sprite - Sprite
     * @param {boolean} blocksMovement - Whether the Entity blocks movement
     * @param {RenderOrder} renderOrder - Z level render depth for layering
     */
    constructor(x, y, name, description, sprite, blocksMovement, renderOrder) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.description = description;
        this.blocksMovement = blocksMovement;
        this.renderOrder = renderOrder;
        this.lightRadius = 8;
        this.parent = null;

        this.setSprite(sprite);

        // Components
        this.fighter = null;
        this.ai = null;
    }

    getGameMap() {
        return this.parent.getGameMap();
    }

    setSprite(sprite) {
        if (sprite) {
            this.sprite = sprite;
            this.sprite.parent = this;
        }
    }

    setComponent(componentName, component) {
        if (component) {
            this[componentName] = component;
            this[componentName].parent = this;
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

    distanceTo(otherEntity) {
        var dx = otherEntity.x - this.x;
        var dy = otherEntity.y - this.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    distance(x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    place(gameMap, x, y) {
        if (this.parent && this.getGameMap() && this.parent === this.getGameMap()) {
            this.getGameMap().removeEntity(this);
        }

        if (x !== undefined) {
            this.x = x;
        }

        if (y !== undefined) {
            this.y = y;
        }

        this.parent = gameMap;
        gameMap.addEntity(this);

        var spriteX = gameMap.offsetWidth + (x * Tilemaps.getTileMap().frameWidth);
        var spriteY = gameMap.offsetHeight + (y * Tilemaps.getTileMap().frameHeight);
        this.sprite.create(gameMap.engineRef.scene, spriteX, spriteY);
    }
}


export class Actor extends Entity {
    /**
     * @param {integer} x - X coordinate of the tile.
     * @param {integer} y - Y coordinate of the tile.
     * @param {string} name - Name of the Actor.
     * @param {string} description - Description of the Actor.
     * @param {Sprite} sprite - Sprite
     * @param {boolean} canOpenDoors - Whether this Actor can open doors
     */
    constructor(x, y, name, description, sprite, canOpenDoors = true) {
        super(x, y, name, description, sprite, true, RenderOrder.ACTOR);
        this.canOpenDoors = canOpenDoors;
    }

    isAlive() {
        return this.ai != null;
    }
}

export class Item extends Entity {
    /**
     * @param {integer} x - X coordinate of the tile.
     * @param {integer} y - Y coordinate of the tile.
     * @param {string} name - Name of the Item.
     * @param {string} description - Description of the Item.
     * @param {Sprite} sprite - Sprite
     * @param {boolean} canOpenDoors - Whether this Item can open doors
     */
    constructor(x, y, name, description, sprite) {
        super(x, y, name, description, sprite, false, RenderOrder.ITEM);
    }
}