import { BaseAI } from "./_baseAi";
import Srand from "seeded-rand";
import { RangedAttackAction, WaitAction } from "../../actions";
import Tiles from "../../ship-gen/tilefactories";

export class ImmobileTurretAi extends BaseAI {
    constructor(entity) {
        super(entity);

        // TEMPORARY - fighter needs range or something
        this.range = 2;
        this._rangeShown = false;
        this._rangeTiles = [];
    }

    perform() {
        const players = this.getEngine().players;

        // If turret is visible, and the range is not currently shown... show them
        if (this._isVisible()) {
            if (!this._rangeShown) {
                this._toggleRangeIndicator(true);
            }
        }
        else if (this._rangeShown) {
            this._toggleRangeIndicator(false);
        }

        let closestPlayer;
        let closestDistance = null;
        for (let i = 0; i < players.length; i++) {
            const target = players[i];
            if (target.isAlive()) {
                const dx = target.x - this.parent.x;
                const dy = target.y - this.parent.y;

                const distance = Math.max(Math.abs(dx), Math.abs(dy));
                if (closestDistance === null || distance < closestDistance || (distance === closestDistance && Srand.intInRange(0, 1) === 0)) {
                    closestPlayer = target;
                    closestDistance = distance;
                }
            }
        }

        // Only take action if a player exists
        if (closestPlayer && this._isVisible() && closestDistance <= this.range) {
            return new RangedAttackAction(this.parent, closestPlayer.x, closestPlayer.y).perform(true);
        }

        return new WaitAction(this.parent).perform(true);
    }

    /**
     *
     * @param {boolean} shouldShow
     */
    _toggleRangeIndicator(shouldShow) {
        // Init tiles if length is 0
        if (!this._rangeTiles.length) {
            for (let dx = -this.range; dx <= this.range; dx++) {
                for (let dy = -this.range; dy <= this.range; dy++) {
                    const tile = Tiles.rangeZone(this.parent.x + dx, this.parent.y + dy, "bd0000");
                    tile.place(this.getGameMap(), tile.x, tile.y);
                    this._rangeTiles.push(tile);
                }
            }
        }

        if (shouldShow) {
            this._rangeTiles.forEach(tile => {
                tile.visible = true;
                tile.sprite.setVisible(true);
            });
            this._rangeShown = true;
        }
        else {
            this._rangeTiles.forEach(tile => {
                tile.visible = false;
                tile.sprite.setVisible(false);
            });
            this._rangeShown = false;
        }
    }

    _isVisible() {
        return this.getGameMap().getShroud()[this.parent.x][this.parent.y].visible;
    }
}
