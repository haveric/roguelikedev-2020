import Tilemaps from './tilemaps.js';

export default class Entity {
    constructor(x, y, name, sprite, blocksMovement) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.sprite = sprite;
        this.blocksMovement = blocksMovement;
        this.lightRadius = 8;
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

    clone() {
        var clonedSprite = this.sprite.clone();
        return new Entity(this.x, this.y, this.name, clonedSprite, this.blocksMovement);
    }

    spawn(gameMap, x, y) {
        var clone = this.clone();
        clone.x = x;
        clone.y = y;
        gameMap.entities.push(clone);

        return clone;
    }
}