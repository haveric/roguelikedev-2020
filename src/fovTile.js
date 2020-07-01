import Entity from './entity.js';
import Sprite from './sprite.js';

export default class FovTile extends Entity {
    constructor(x, y, name) {
        super(x, y, name);

        this.sprite = new Sprite("shroud", "000000");
        this.explored = false;
        this.visible = false;
    }

    explore() {
        this.explored = true;
        this.visible = true;
    }

    resetVisible() {
        this.visible = false;
    }

    render() {
        if (this.explored) {
            if (this.visible) {
                this.sprite.spriteObject.setAlpha(0);
            } else {
                this.sprite.spriteObject.setAlpha(.5);
            }
        }
    }
}