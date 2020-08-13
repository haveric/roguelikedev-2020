import AskUserEventHandler from "../_askUserEventHandler";

export default class InventoryEventHandler extends AskUserEventHandler {
    constructor(engine) {
        super(engine);

        this.title = "<missing title>";
    }

    render() {
        const inventoryMenu = this.engineRef.ui.inventoryMenu;
        inventoryMenu.show();
        inventoryMenu.text(this.title + "\n\n");
        const items = this.engineRef.player.inventory.items;
        const itemsLength = items.length;
        if (itemsLength === 0) {
            inventoryMenu.text("(Empty)");
        } else {
            for (let i = 0; i < itemsLength; i++) {
                const itemKey = String.fromCharCode(65 + i);
                let itemLine = "(" + itemKey + ") " + items[i].name;
                if (items[i].amount > 1) {
                    itemLine += " x" + items[i].amount;
                }
                if (this.engineRef.player.equipment.mainHand === items[i]) {
                    itemLine += " (on main hand)";
                } else if (this.engineRef.player.equipment.offHand === items[i]) {
                    itemLine += " (on off hand)";
                }
                inventoryMenu.text(itemLine + "\n");
            }
        }

        inventoryMenu.build();
    }

    pressKey(event) {
        const player = this.engineRef.player;
        const charAKeyCode = 65;
        const index = event.keyCode - charAKeyCode;

        if (index >= 0 && index < 26) {
            const selectedItem = player.inventory.items[index];
            if (selectedItem) {
                this.selectItem(index, selectedItem);
                return;
            }
        }

        super.pressKey(event);
    }

    selectItem(/*index, item*/) {
        // Do nothing for base InventoryEventHandler
    }

    exit() {
        this.engineRef.ui.inventoryMenu.hide();
        super.exit();
    }
}