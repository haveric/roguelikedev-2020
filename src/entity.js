export default class Entity {
    constructor(x, y, name, sprite, blocksMovement) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.sprite = sprite;
        this.blocksMovement = blocksMovement;
    }

    move(engine, dx, dy) {
        this.x += dx;
        this.y += dy;

        this.sprite.move(dx * engine.tilemap.frameWidth, dy * engine.tilemap.frameHeight);
    }

    moveTo(engine, x, y) {
        this.x = x;
        this.y = y;

        this.sprite.moveTo(engine.gameMap.offsetWidth + (x * engine.tilemap.frameWidth), engine.gameMap.offsetHeight + (y * engine.tilemap.frameHeight));
    }
}