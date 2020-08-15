import InventoryEventHandler from "./_inventoryEventHandler";

export default class InventoryEquipEventHandler extends InventoryEventHandler {
    constructor(engine) {
        super(engine);

        this.title = "Select an item to equip";
        this.render();
    }

    selectItem(index/*, item*/) {
        this.equipItem(index);
    }
}