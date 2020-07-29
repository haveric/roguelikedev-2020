import MessageLog from "./messageLog";
import SidePanel from "./sidePanel";
import InventoryMenu from "./inventoryMenu";

export default class UI {
    constructor(scene) {
        this.messageLog = new MessageLog(scene);
        this.sidePanel = new SidePanel(scene);
        this.inventoryMenu = new InventoryMenu(scene);
    }

    // put a message

    // update energy
}