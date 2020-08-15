import ItemAction from "./_itemAction";
import ActionResult from "../actionResult";

export default class DropItemAction extends ItemAction {
    constructor(entity, inventorySlot, targetXY) {
        super(entity, inventorySlot, targetXY);
    }

    perform(doAction) {
        if (doAction) {
            const item = this.entityRef.inventory.dropByIndex(this.inventorySlot);

            // handle de-equipping dropped items automatically
            if (item.equippable && this.entityRef.equipment) {
                if(this.entityRef.equipment.mainHand === item || this.entityRef.equipment.offHand === item) {
                    this.entityRef.equipment.toggleEquip(item);
                }
            }
        }

        return new ActionResult(this, true);
    }

    toString() {
        return { action: "DropItemAction", args: { inventorySlot: this.inventorySlot }};
    }
}