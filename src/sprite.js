import { getFrameOf } from '../utils.js';
import Tilemaps from './tilemaps.js';

export default class Sprite {
    constructor(name, color) {
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
            this.spriteObject = scene.add.sprite(x, y, Tilemaps.getTileMap().name).setOrigin(0, 0);
            this.spriteObject.setFrame(frame);
            this.spriteObject.setTint("0x" + this.color);
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