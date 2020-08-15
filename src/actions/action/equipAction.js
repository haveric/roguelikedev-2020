import Action from "./_action";
import ActionResult from "../actionResult";

export default class EquipAction extends Action {
    constructor(entity, inventorySlot) {
        super(entity);
        this.inventorySlot = inventorySlot;
    }

    perform(doAction) {
        if (doAction) {
            // check if entity has equipment
            const messageLog = this.getEngine().ui.messageLog;
            const equippable = this.entityRef.inventory.items[this.inventorySlot];
            if(this.entityRef.equipment && equippable.equippable) {
                this.results = this.entityRef.equipment.toggleEquip(equippable);
                const self = this;
                this.results.forEach(function (result) {
                    const equipped = result.equipped;
                    const dequipped = result.dequipped;
                    let playerString;
                    if (self.isCurrentPlayer()) {
                        playerString = "You";
                    } else {
                        playerString = self.entityRef.name;
                    }
                    if (equipped) {
                        messageLog.text(playerString + " equipped the " + equippable.name + "!").build();
                    }
                    if (dequipped) {
                        messageLog.text(playerString + " dequipped the " + equippable.name + "!").build();
                    }
                });
            } else {
                if (this.isCurrentPlayer()) {
                    messageLog.text("You are unable to equip this item.").build();
                }
                return new ActionResult(this, false, false);
            }
        }

        return new ActionResult(this, true);
    }

    toString() {
        return { action: "EquipAction", args: { inventorySlot: this.inventorySlot }};
    }
}