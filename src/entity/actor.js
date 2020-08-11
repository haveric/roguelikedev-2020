import RenderOrder from "../utils/renderOrder";
import Entity from "./entity";

export default class Actor extends Entity {
    /**
     * @param x {integer} - X tile coordinate of the Actor (from left->right).
     * @param y {integer} - Y tile coordinate of the Actor (from top->bottom).
     * @param name {string} - Name of the Actor.
     * @param description {string} - Description of the Actor.
     * @param sprite {Sprite} - Sprite of the Actor.
     * @param canOpenDoors {boolean} - Whether this Actor can open doors.
     */
    constructor(x, y, name, description, sprite, canOpenDoors = true) {
        super(x, y, name, description, sprite, true, RenderOrder.ACTOR);
        this.canOpenDoors = canOpenDoors;
    }

    isAlive() {
        return this.ai !== null;
    }
}