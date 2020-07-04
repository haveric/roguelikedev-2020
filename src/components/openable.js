export default class Openable {
    constructor(tile, isOpen, spriteName, spriteOpenName) {
        this.tile = tile;
        this.isOpen = isOpen;
        this.spriteName = spriteName;
        this.spriteOpenName = spriteOpenName
    }

    open() {
        if (!this.isOpen) {
            this.isOpen = true;

            this.tile.walkable = true;
            this.tile.blockFOV = false;

            this.tile.sprite.updateSprite(this.spriteOpenName);
        }
    }

    close() {
        if (this.isOpen) {
            this.isOpen = false;

            this.tile.walkable = false;
            this.tile.blockFOV = true;

            this.tile.sprite.updateSprite(this.spriteName);
        }
    }
}