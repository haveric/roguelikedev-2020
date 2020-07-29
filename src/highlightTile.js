import Entity from "./entity";
import Sprite from "./sprite";
import RenderOrder from "./renderOrder";

export default class HighlightTile extends Entity {
    constructor(x, y, name) {
        super(x, y, name);

        this.visible = false;
        this.renderOrder = RenderOrder.HIGHLIGHT;

        this.setSprite(new Sprite("highlight", "000000"));
    }

    render() {
        this.sprite.spriteObject.setDepth(this.renderOrder);

        if (this.visible) {
            this.sprite.spriteObject.setAlpha(.2);
            this.sprite.spriteObject.setTint("0xff0000");
        } else {
            this.sprite.spriteObject.setAlpha(0);
        }
    }

    setVisible(newVisible) {
        this.visible = newVisible;
        this.render();
    }
}