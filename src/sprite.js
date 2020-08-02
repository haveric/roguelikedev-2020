import { getSpriteDetails } from "../utils";
import Tilemaps from "./tilemaps";

export default class Sprite {
    constructor(name, color) {
        this.parent = null;
        this.name = name;
        this.color = color;
        this.spriteObject = null;
    }

    create(scene, x, y) {
        this.destroy();
        this.spriteObject = scene.add.sprite(x, y, Tilemaps.getTileMap().name).setOrigin(0, 0);

        this.updateSprite(this.name);
    }

    destroy() {
        if (this.spriteObject) {
            this.spriteObject.destroy();
        }
    }

    updateSprite(name) {
        this.name = name;
        const spriteDetails = getSpriteDetails(Tilemaps.getTileMap(), this.name, this.color);
        if (spriteDetails !== null) {
            this.spriteObject.setFrame(spriteDetails.frame);
            if (spriteDetails.color) {
                this.color = spriteDetails.color;
                this.spriteObject.setTint("0x" + spriteDetails.color);
            } else {
                this.spriteObject.clearTint();
            }
        }

        this.spriteObject.setDepth(this.parent.renderOrder);
    }

    move(dx, dy) {
        if (this.spriteObject) {
            this.spriteObject.x += dx;
            this.spriteObject.y += dy;
        }
    }

    moveTo(x, y) {
        if (this.spriteObject) {
            this.spriteObject.x = x;
            this.spriteObject.y = y;
        }
    }
}