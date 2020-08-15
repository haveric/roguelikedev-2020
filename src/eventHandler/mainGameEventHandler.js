import {OpenAction, CloseAction} from "../actions/";
import EventHandler from "./_eventHandler";
import InventoryActivateEventHandler from "./askUserEventHandler/inventoryEventHandler/inventoryActivateEventHandler";
import InventoryDropEventHandler from "./askUserEventHandler/inventoryEventHandler/inventoryDropEventHandler";
import InventoryEquipEventHandler from "./askUserEventHandler/inventoryEventHandler/inventoryEquipEventHandler";
import SelectDirectionHandler from "./askUserEventHandler/selectDirectionEventHandler";
import LookHandler from "./askUserEventHandler/selectIndexHandler/lookHandler";

export default class MainGameEventHandler extends EventHandler {
    constructor(engine) {
        super(engine);
    }

    pressKey(event) {
        const self = this;

        let player;
        let targets;
        let i;
        let j;
        let x;
        let y;
        switch (event.code) {
            // Left
            case "ArrowLeft":
            case "Numpad4":
                self.move(-1, 0);
                break;
            // Right
            case "ArrowRight":
            case "Numpad6":
                self.move(1, 0);
                break;
            // Up
            case "ArrowUp":
            case "Numpad8":
                self.move(0, -1);
                break;
            // Down
            case "ArrowDown":
            case "Numpad2":
                self.move(0, 1);
                break;
            // Northwest
            case "Numpad7":
                self.move(-1, -1);
                break;
            // Northeast
            case "Numpad9":
                self.move(1, -1);
                break;
            // Southwest
            case "Numpad1":
                self.move(-1, 1);
                break;
            // Southeast
            case "Numpad3":
                self.move(1, 1);
                break;
            // Wait
            case "Numpad5":
                self.wait();
                break;
            case "KeyG":
                self.pickup();
                break;
            case "KeyI":
                this.engineRef.eventHandler = new InventoryActivateEventHandler(this.engineRef);
                break;
            case "KeyD":
                this.engineRef.eventHandler = new InventoryDropEventHandler(this.engineRef);
                break;
            case "KeyE":
                this.engineRef.eventHandler = new InventoryEquipEventHandler(this.engineRef);
                break;
            case "KeyO":
                player = this.engineRef.player;
                targets = [];

                for (i = -1; i <= 1; i++) {
                    for (j = -1; j <= 1; j++) {
                        if (i !== 0 || j !== 0) {
                            x = player.x + i;
                            y = player.y + j;
                            const success = this.engineRef.gameMap.locations[x][y].tileComponentCheck("openable", "getIsOpen");
                            if (success === false) {
                                targets.push({"x": x, "y": y});
                            }
                        }
                    }
                }

                this.engineRef.eventHandler = new SelectDirectionHandler(this.engineRef, targets, function(dx, dy) {
                    return new OpenAction(player, dx, dy);
                });
                break;
            case "KeyC":
                player = this.engineRef.player;
                targets = [];

                for (i = -1; i <= 1; i++) {
                    for (j = -1; j <= 1; j++) {
                        if (i !== 0 || j !== 0) {
                            x = player.x + i;
                            y = player.y + j;
                            if (this.engineRef.gameMap.locations[x][y].tileComponentCheck("openable", "getIsOpen")) {
                                targets.push({"x": x, "y": y});
                            }
                        }
                    }
                }

                this.engineRef.eventHandler = new SelectDirectionHandler(this.engineRef, targets, function(dx, dy) {
                    return new CloseAction(player, dx, dy);
                });
                break;
            case "Backslash":
                this.engineRef.eventHandler = new LookHandler(this.engineRef);
                break;
            case "Minus":
                self.zoom(-1);
                break;
            case "Equal":
                self.zoom(1);
                break;
            case "Home":
                self.debug();
                break;
            case "Insert":
                self.addEnergy();
                break;
            case "Enter":
            case "NumpadEnter":
                self.interactWithTile();
                break;
            case "PageDown":
                console.log("Entering Debug Room...");
                self.debugRoom();
                break;
            case "PageUp":
                console.log("Regenerating map...");
                self.regenMap();
                break;
            default:
                break;
        }
    }

    mouseMove(event) {
        this.updateSidePanelDescriptionsForWorldPosition(event.worldX, event.worldY);
    }
}