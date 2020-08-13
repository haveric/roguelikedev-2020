import SelectIndexHandler from "./_selectIndexHandler";

export default class AreaRangedAttackHandler extends SelectIndexHandler {
    constructor(engine, radius, callback) {
        super(engine);

        this.radius = radius;
        this.callback = callback;
        this.highlightTile(this.x, this.y, true);
    }

    highlightTile(x, y, moveCamera) {
        this.targetX = x;
        this.targetY = y;
        for (let i = this.lastX - this.radius + 1; i < this.lastX + this.radius; i++) {
            for (let j = this.lastY - this.radius + 1; j < this.lastY + this.radius; j++) {
                if (this.engineRef.gameMap.highlight[i] && this.engineRef.gameMap.highlight[i][j]) {
                    this.engineRef.gameMap.highlight[i][j].setVisible(false);
                }
            }
        }

        for (let i = x - this.radius + 1; i < x + this.radius; i++) {
            for (let j = y - this.radius + 1; j < y + this.radius; j++) {
                if (this.engineRef.gameMap.highlight[i] && this.engineRef.gameMap.highlight[i][j]) {
                    this.engineRef.gameMap.highlight[i][j].setVisible(true);
                }
            }
        }

        if (moveCamera && this.engineRef.gameMap.highlight[x] && this.engineRef.gameMap.highlight[x][y]) {
            this.engineRef.scene.updateCameraView(this.engineRef.gameMap.highlight[x][y].sprite.spriteObject);
        }
    }

    clearHighlight() {
        for (let i = this.targetX - this.radius; i < this.targetX + this.radius; i++) {
            for (let j = this.targetY - this.radius; j < this.targetY + this.radius; j++) {
                if (this.engineRef.gameMap.highlight[i] && this.engineRef.gameMap.highlight[i][j]) {
                    this.engineRef.gameMap.highlight[i][j].setVisible(false);
                }
            }
        }
    }

    mouseMove(event) {
        this.updateSidePanelDescriptionsForWorldPosition(event.worldX, event.worldY);
        const x = this.getTileXFromWorldX(event.worldX);
        const y = this.getTileYFromWorldY(event.worldY);
        this.highlightTile(x, y, false);
        this.lastX = x;
        this.lastY = y;
    }

    selectTile() {
        this.performAction(this.callback(this.targetX, this.targetY));
        this.exit();
    }
}