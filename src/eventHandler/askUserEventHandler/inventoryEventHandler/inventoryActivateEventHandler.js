import InventoryEventHandler from "./_inventoryEventHandler";

export default class InventoryActivateEventHandler extends InventoryEventHandler {
    constructor(engine) {
        super(engine);

        this.title = "Select an item to use";
        this.render();
    }

    selectItem(index, item) {
        if (item.consumable) {
            this.performAction(item.consumable.getAction(this.engineRef.player, index));
        } else {
            this.engineRef.ui.messageLog.text("You're not really sure what to do with " + item.name + ".").build();
        }
    }
}