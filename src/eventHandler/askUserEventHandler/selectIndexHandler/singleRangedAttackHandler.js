import SelectIndexHandler from "./_selectIndexHandler";

export default class SingleRangedAttackHandler extends SelectIndexHandler {
    constructor(engine, callback) {
        super(engine);

        this.callback = callback;
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