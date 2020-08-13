import Tilemaps from "../tilemaps";
import Item from "../entity/item";
import * as Actions from "../actions/";

export default class EventHandler {
    constructor(engine) {
        this.engineRef = engine;

        this.input = this.engineRef.scene.input;
        this.keysDown = {};

        this.initEvents();
    }

    addKey(keyCode) {
        this.keysDown[keyCode] = 1;
    }

    removeKey(keyCode) {
        this.keysDown[keyCode] = 0;
    }

    initEvents() {
        const self = this;
        this.input.keyboard.off("keydown").on("keydown", function(event) {
            const numLockOn = event.getModifierState("NumLock");
            if (numLockOn && !event.shiftKey && event.code.startsWith("Numpad") && event.keyCode < 90) {
                event.numLockShiftKey = true;
            }
            if (self.debugEnabled || !self.keysDown[event.code]) {
                self.pressKey(event);
            }

            self.addKey(event.code);
        });

        this.input.keyboard.off("keyup").on("keyup", function(event) {
            self.removeKey(event.code);
        });

        this.input.off("pointermove").on("pointermove", function(event) {
            self.mouseMove(event);
        });

        this.input.off("pointerup").on("pointerup", function(event) {
            self.mouseClick(event);
        });
    }

    pressKey(/*event*/) {
        // Do nothing for base Event Handler
    }

    mouseMove(/*event*/) {
        // Do nothing for base Event Handler
    }

    mouseClick(/*event*/) {
        // Do nothing for base Event Handler
    }

    getTileXFromWorldX(worldX) {
        return Math.floor((worldX - this.engineRef.gameMap.offsetWidth) / Tilemaps.getTileMap().frameWidth);
    }

    getTileYFromWorldY(worldY) {
        return Math.floor((worldY - this.engineRef.gameMap.offsetHeight) / Tilemaps.getTileMap().frameHeight);
    }

    updateSidePanelDescriptionsForWorldPosition(worldX, worldY) {
        const x = this.getTileXFromWorldX(worldX);
        const y = this.getTileYFromWorldY(worldY);

        this.updateSidePanelDescriptionsForTile(x, y);
    }

    updateSidePanelDescriptionsForTile(x, y, skipBlocking) {
        const gameMap = this.engineRef.gameMap;
        const sidePanel = this.engineRef.ui.sidePanel;
        if (gameMap.locations[x] && gameMap.locations[x][y]) {
            sidePanel.text("Looking at [" + x + "][" + y + "]:\n");

            if (gameMap.shroud[x][y].visible || gameMap.shroud[x][y].explored) {
                if (!skipBlocking) {
                    const entity = gameMap.getBlockingEntityAtLocation(x, y);
                    if (entity) {
                        sidePanel.text(entity.name + "\n", "#" + entity.sprite.color);
                        sidePanel.text(entity.description + "\n\n");
                    }
                }

                const entities = gameMap.getNonBlockingEntitiesAtLocation(x, y);
                for (let i = 0; i < entities.length; i++) {
                    const entity = entities[i];
                    sidePanel.text(entity.name, "#" + entity.sprite.color);
                    if (entity instanceof Item && entity.amount > 1) {
                        sidePanel.text(" x" + entity.amount);
                    }
                    sidePanel.text("\n");

                    if (entities.length === 1) {
                        sidePanel.text(entity.description + "\n\n");
                    }
                }
                if (entities.length > 1) {
                    sidePanel.text("\n");
                }

                const tiles = gameMap.locations[x][y].tiles;
                for (let i = 0; i < tiles.length; i++) {
                    const tile = tiles[i];
                    sidePanel.text(tile.name + "\n");
                    sidePanel.text(tile.description + "\n\n");
                }
            } else {
                sidePanel.text("You can't see here." + "\n");
            }

            sidePanel.build();
        } else {
            sidePanel.text("").build();
        }
    }

    move(dx, dy) {
        this.performAction(new Actions.BumpAction(this.engineRef.player, dx, dy));
    }

    warp(x, y) {
        this.performAction(new Actions.WarpAction(this.engineRef.player, x, y));
    }

    wait() {
        this.performAction(new Actions.WaitAction(this.engineRef.player));
    }

    pickup() {
        this.performAction(new Actions.PickupAction(this.engineRef.player));
    }

    interactWithTile() {
        this.performAction(new Actions.InteractWithTileAction(this.engineRef.player));
    }

    dropItem(inventorySlot) {
        this.performAction(new Actions.DropItemAction(this.engineRef.player, inventorySlot));
    }

    equipItem(inventorySlot) {
        this.performAction(new Actions.EquipAction(this.engineRef.player, inventorySlot));
    }

    performAction(action) {
        if (action && this.engineRef.player) {
            const actionResult = action.perform(false);
            if (actionResult.success) {
                const scene = this.engineRef.scene;
                scene.socket.emit("s-performAction", {roomId: scene.room.roomId, playerId: scene.socket.id, useEnergy: actionResult.useEnergy, actionData: actionResult.action.toString()});
            }
        }
    }

    zoom(zoomLevel) {
        if (zoomLevel === 1) { // Zoom In
            if (this.engineRef.zoomLevel < 2) {
                this.engineRef.zoomLevel ++;
            }
        } else if (zoomLevel === -1) { // Zoom Out
            if (this.engineRef.zoomLevel > -1) {
                this.engineRef.zoomLevel --;
            }
        }

        let zoom;
        switch(this.engineRef.zoomLevel) {
            case 1: zoom = 1; break;
            case 2: zoom = 2; break;
            case 0: zoom = .5; break;
            case -1: zoom = .25; break;
            default: zoom = 1; break;
        }
        this.engineRef.scene.cameras.main.setZoom(zoom);
    }

    debug() {
        const scene = this.engineRef.scene;
        const player = this.engineRef.player;
        this.performAction(new Actions.DebugAction(this.engineRef.player));
        player.energy = 5000;
        player.energyMax = 5000;
        this.engineRef.debugEnabled = true;

        scene.events.emit("ui-updateEnergy", {energy: player.energy, energyMax: player.energyMax });
        scene.socket.emit("updateEnergy", { roomId: scene.room.roomId, playerId: scene.socket.id, energy: player.energy, energyMax: player.energyMax, giveEnergy: false});
    }

    addEnergy() {
        const scene = this.engineRef.scene;
        const player = this.engineRef.player;
        player.energy = 5000;
        player.energyMax = 5000;
        scene.events.emit("ui-updateEnergy", {energy: player.energy, energyMax: player.energyMax });
        scene.socket.emit("updateEnergy", { roomId: scene.room.roomId, playerId: scene.socket.id, energy: player.energy, energyMax: player.energyMax});
    }

    debugRoom() {
        const scene = this.engineRef.scene;
        scene.socket.emit("s-createDebugRoom", { roomId: scene.room.roomId, playerId: scene.socket.id });
    }

    regenMap() {
        const scene = this.engineRef.scene;
        scene.socket.emit("s-regenMap", { roomId: scene.room.roomId });
    }
}