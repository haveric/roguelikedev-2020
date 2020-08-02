import Tilemaps from "../tilemaps";
import RenderOrder from "../renderOrder"; // eslint-disable-line no-unused-vars
import Sprite from "../sprite"; // eslint-disable-line no-unused-vars

export default class Entity {
    /**
     * @param x {integer} - X tile coordinate of the Entity (from left->right).
     * @param y {integer} - Y tile coordinate of the Entity (from top->bottom).
     * @param name {string} - Name of the Entity.
     * @param description {string} - Description of the Entity.
     * @param sprite {Sprite} - Sprite of the Entity.
     * @param blocksMovement {boolean} - Whether this Entity blocks other Entities' movement.
     * @param renderOrder {RenderOrder} - Visual depth to render the Sprite.

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
        const dx = otherEntity.x - this.x;
        const dy = otherEntity.y - this.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    distance(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
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

        const spriteX = gameMap.offsetWidth + (x * Tilemaps.getTileMap().frameWidth);
        const spriteY = gameMap.offsetHeight + (y * Tilemaps.getTileMap().frameHeight);
        if (gameMap === gameMap.engineRef.gameMap) {
            this.sprite.create(gameMap.engineRef.scene, spriteX, spriteY);
        } else {
            this.sprite.destroy();
        }
    }
}

