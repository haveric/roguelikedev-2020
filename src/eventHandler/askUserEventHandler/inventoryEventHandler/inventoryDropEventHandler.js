import InventoryEventHandler from "./_inventoryEventHandler";

export default class InventoryDropEventHandler extends InventoryEventHandler {
    constructor(engine) {
        super(engine);

        this.title = "Select an item to drop";
        this.render();
    }

    selectItem(index/*, item*/) {
        this.dropItem(index);
    }
}