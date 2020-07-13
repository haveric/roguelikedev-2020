import Entity from './entity';

export default class Tile extends Entity {
    constructor(x, y, name, description, sprite, walkable, blockFOV, renderOrder) {
        super(x, y, name, description, sprite, false, renderOrder);

        this.walkable = walkable; // True if this tile can be walked over
        this.blockFOV = blockFOV; // True if this tile blocks FOV
    }
}