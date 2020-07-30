import MessageLog from "./messageLog";
import SidePanel from "./sidePanel";
import InventoryMenu from "./inventoryMenu";
import FullScreenDialog from "./fullScreenDialog";
import { CONTROLS } from "./controls";

export default class UI {
    constructor(scene, engine) {
        this.engine = engine;
        this.scene = scene;
        this.messageLog = new MessageLog(scene);
        this.sidePanel = new SidePanel(scene);
        this.inventoryMenu = new InventoryMenu(scene);
        this.fullScreenDialog = new FullScreenDialog(this);
    }

    showControls() {
        this.fullScreenDialog.showDialog("Controls", CONTROLS);
    }

    hideDialog() {
        this.fullScreenDialog.hideDialog();
    }

    // put a message

    // update energy
}