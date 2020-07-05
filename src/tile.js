import Entity from './entity';

export default class Tile extends Entity {
    constructor(x, y, name, sprite, walkable, blockFOV) {
        super(x, y, name, sprite);

        this.walkable = walkable; // True if this tile can be walked over
        this.blockFOV = blockFOV; // True if this tile blocks FOV
    }
}