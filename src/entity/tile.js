import Entity from "./_entity";
import Sprite from "../sprite"; // eslint-disable-line no-unused-vars

export default class Tile extends Entity {
    /**
     * @param x {integer} - X tile coordinate of the Tile (from left->right).
     * @param y {integer} - Y tile coordinate of the Tile (from top->bottom).
     * @param name {string} - Name of the Tile.
     * @param description {string} - Description of the Tile.
     * @param sprite {Sprite} - Sprite of the Tile.
     * @param walkable {boolean} - True if this Tile can be walked over.
     * @param blockFOV {boolean} - True if this Tile blocks FOV.
     * @param renderOrder {RenderOrder} - Visual depth to render the Sprite.
     */
    constructor(x, y, name, description, sprite, walkable, blockFOV, renderOrder) {
        super(x, y, name, description, sprite, false, renderOrder);

        this.walkable = walkable;
        this.blockFOV = blockFOV;
    }
}