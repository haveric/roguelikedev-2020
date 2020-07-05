import Entity from './entity';
import Sprite from './sprite';

export default class FovTile extends Entity {
    constructor(x, y, name) {
        super(x, y, name);

        this.sprite = new Sprite("shroud", "000000");
        this.explored = false;
        this.visible = false;
        this.lightSources = [];
    }

    _getBlendedLight() {
        var blendedColor;
        var intensities = 0;
        var numLightSources = this.lightSources.length;
        if (numLightSources > 0) {
            for (var i = 0; i < numLightSources; i++) {
                var lightSource = this.lightSources[i];
                intensities += Number(lightSource.intensity);

                if (i == 0) {
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
        const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
        const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
        const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
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
                if (this.lightSources.length == 0) {
                    this.sprite.spriteObject.setAlpha(0);
                } else {
                    var data = this._getBlendedLight();

                    this.sprite.spriteObject.setAlpha(data.intensity);
                    this.sprite.spriteObject.setTint("0x" + data.color);
                }
            } else {
                this.sprite.spriteObject.setAlpha(.5);
                this.sprite.spriteObject.setTint(null);
            }
        }
    }
}