import Entity from "./entity";
import Sprite from "../sprite";
import RenderOrder from "../utils/renderOrder";

export default class FovTile extends Entity {
    /**
     * @param x {integer} - X tile coordinate of the FovTile (from left->right).
     * @param y {integer} - Y tile coordinate of the FovTile (from top->bottom).
     */
    constructor(x, y) {
        super(x, y, "shroud");

        this.explored = false;
        this.visible = false;
        this.lightSources = [];
        this.renderOrder = RenderOrder.FOV;

        this.setSprite(new Sprite("shroud", "000000"));
    }

    _getBlendedLight() {
        let blendedColor;
        let intensities = 0;
        const numLightSources = this.lightSources.length;
        if (numLightSources > 0) {
            for (let i = 0; i < numLightSources; i++) {
                const lightSource = this.lightSources[i];
                intensities += Number(lightSource.intensity);

                if (i === 0) {
                    blendedColor = lightSource.color;
                } else {
                    blendedColor = this._blendColors(blendedColor, lightSource.color, .5);
                }
            }

            intensities = intensities / numLightSources;
        }

        return { color: blendedColor, intensity: intensities };
    }

    _blendColors(colorA, colorB, amount) {
        const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
        const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
        const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, "0");
        const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, "0");
        const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, "0");
        return r + g + b;
    }

    explore() {
        this.explored = true;
        this.visible = true;
    }

    addLightSource(lightSource) {
        if (!this.lightSources.includes(lightSource)) {
            this.lightSources.push(lightSource);
        }
    }

    resetVisible() {
        this.visible = false;
    }

    render() {
        if (this.explored) {
            if (this.visible) {
                if (this.lightSources.length === 0) {
                    this.sprite.spriteObject.setAlpha(0);
                } else {
                    const data = this._getBlendedLight();

                    this.sprite.spriteObject.setAlpha(data.intensity);
                    this.sprite.spriteObject.setTint("0x" + data.color);

                    this.renderOrder = RenderOrder.FLOOR_LIGHTING;
                    this.sprite.spriteObject.setDepth(this.renderOrder);
                }
            } else {
                this.sprite.spriteObject.setAlpha(.5);
                this.sprite.spriteObject.setTint(null);

                this.renderOrder = RenderOrder.FOV;
                this.sprite.spriteObject.setDepth(this.renderOrder);
            }
        }
    }
}