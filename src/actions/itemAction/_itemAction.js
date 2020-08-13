import Action from "../action/_action";
import ActionResult from "../actionResult";

export default class ItemAction extends Action {
    constructor(entity, inventorySlot, targetXY) {
        super(entity);

        this.inventorySlot = inventorySlot;
        this.targetXY = targetXY;
        if (!this.targetXY) {
            this.targetXY = {
                "x": this.entityRef.x,
                "y": this.entityRef.y
            };
        }
    }

    getTargetActor() {
        return this.getGameMap().getActorAtLocation(this.targetXY.x, this.targetXY.y);
    }

    perform(doAction) {
        const item = this.entityRef.inventory.items[this.inventorySlot];
        const success = item.consumable.activate(this, doAction);

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "ItemAction", args: { inventorySlot: this.inventorySlot, targetXY: this.targetXY }};
    }
}