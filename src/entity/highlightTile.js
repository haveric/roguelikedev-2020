import Entity from "./entity";
import Sprite from "../sprite";
import RenderOrder from "../utils/renderOrder";
import Tilemaps from "../tilemaps";

export default class HighlightTile extends Entity {
    /**
     * @param x {integer} - X tile coordinate of the HighlightTile (from left->right).
     * @param y {integer} - Y tile coordinate of the HighlightTile (from top->bottom).
     */
    constructor(x, y) {
        super(x, y, "highlight");

        this.visible = false;
        this.renderOrder = RenderOrder.HIGHLIGHT;

        this.setSprite(new Sprite("highlight", "000000"));
    }

    render() {
        if (!this.sprite.spriteObject) {
            const gameMap = this.getGameMap();
            const spriteX = gameMap.offsetWidth + (this.x * Tilemaps.getTileMap().frameWidth);
            const spriteY = gameMap.offsetHeight + (this.y * Tilemaps.getTileMap().frameHeight);

            this.sprite.create(gameMap.engineRef.scene, spriteX, spriteY, Tilemaps.getTileMap().name);
        }

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