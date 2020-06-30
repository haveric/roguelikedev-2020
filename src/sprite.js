import { getFrameOf } from '../utils.js';

export default class Sprite {
    constructor(name, icon, color, bgIcon, bgColor) {
        this.name = name;
        this.icon = icon;
        this.color = color;
        this.bgIcon = bgIcon;
        this.bgColor = bgColor;
        this.spriteObjects = [];
    }

    create(scene, x, y, tilemapName) {
        var frameData = getFrameOf(scene, this.name, this.icon, this.bgIcon);
        if (frameData.bgFrame != null) {
            var bgSpriteObject = scene.add.sprite(x, y, tilemapName).setOrigin(0, 0);
            bgSpriteObject.setFrame(frameData.bgFrame);
            bgSpriteObject.setTint("0x" + this.bgColor);
            this.spriteObjects.push(bgSpriteObject);
        }

        if (frameData.frame != null) {
            var spriteObject = scene.add.sprite(x, y, tilemapName).setOrigin(0, 0);
            spriteObject.setFrame(frameData.frame);
            spriteObject.setTint("0x" + this.color);
            this.spriteObjects.push(spriteObject);
        }
    }

    move(dx, dy) {
        for (var i = 0; i < this.spriteObjects.length; i++) {
            var spriteObject = this.spriteObjects[i];
            spriteObject.x += dx;
            spriteObject.y += dy;
        }
    }

    moveTo(x, y) {
        for (var i = 0; i < this.spriteObjects.length; i++) {
            var spriteObject = this.spriteObjects[i];
            spriteObject.x = x;
            spriteObject.y = y;
        }
    }
}