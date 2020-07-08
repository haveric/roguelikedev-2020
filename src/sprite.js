import { getFrameOf } from '../utils';
import Tilemaps from './tilemaps';

export default class Sprite {
    constructor(name, color) {
        this.owner = null;
        this.name = name;
        this.color = color;
        this.spriteObject = null;
    }

    clone() {
        return new Sprite(this.name, this.color, this.spriteObject);
    }

    create(scene, x, y) {
        var frame = getFrameOf(Tilemaps.getTileMap(), this.name);
        if (frame != null) {
            if (this.spriteObject) {
                this.spriteObject.destroy();
            }
            this.spriteObject = scene.add.sprite(x, y, Tilemaps.getTileMap().name).setOrigin(0, 0);
            this.spriteObject.setFrame(frame);
            this.spriteObject.setTint("0x" + this.color);
            if (this.owner) {
                this.spriteObject.setDepth(this.owner.renderOrder);
            }
        }
    }

    updateSprite(name) {
        this.name = name;
        var frame = getFrameOf(Tilemaps.getTileMap(), this.name);
        if (frame != null) {
            this.spriteObject.setFrame(frame);
        }
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