import MessageLog from "./messageLog";
import SidePanel from "./sidePanel";
import InventoryMenu from "./inventoryMenu";
import FullScreenDialog from "./fullScreenDialog";
import { CONTROLS } from "./controls";
import EndGameDialog from "./endGameDialog";

export default class UI {
    constructor(scene, engine) {
        this.engine = engine;
        this.scene = scene;
        this.messageLog = new MessageLog(scene);
        this.sidePanel = new SidePanel(scene);
        this.inventoryMenu = new InventoryMenu(scene);
        this.fullScreenDialog = new FullScreenDialog(this);
        this.endGameDialog = new EndGameDialog(this);
    }

    showControls() {
        this.fullScreenDialog.showDialog("Controls", CONTROLS);
    }

    showEndGameDialog() {
        this.endGameDialog.showDialog("Game Over!", "Everyone is dead or exhausted!\nTry again?");
    }

    updateEndGameDialogOtherPlayerWaiting() {
        console.log("Update end game dialog - other player waiting");
        this.endGameDialog.updateText("Other player is waiting to restart.");
    }

    hideFullScreenDialog() {
        this.fullScreenDialog.hideDialog();
    }

    // put a message

    // update energy
}