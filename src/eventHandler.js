import { BumpAction, WaitAction, PickupAction, WarpAction, DropItemAction, DebugAction } from './actions';
import Tilemaps from './tilemaps';

export class EventHandler extends Phaser.Events.EventEmitter {
    constructor(input, engine) {
        super();
        this.engineRef = engine;

        this.input = input;
        this.keysDown = [];

        this.initEvents();
    }

    initEvents() {
        var self = this;
        this.input.keyboard.off('keydown').on('keydown', function(event) {
            if (self.debugEnabled || !self.keysDown[event.code]) {
                self.pressKey(event);
            }

            self.keysDown[event.code] = 1;
        });

        this.input.keyboard.off('keyup').on('keyup', function(event) {
            self.keysDown[event.code] = 0;
        });

        this.input.off('pointermove').on('pointermove', function(event) {
            self.mouseMove(event);
        });

        this.input.off('pointerup').on('pointerup', function(event) {
            self.mouseClick(event);
        });
    }

    pressKey(event) {
        // Do nothing for base Event Handler
    }

    mouseMove(event) {
        // Do nothing for base Event Handler
    }

    mouseClick(event) {
        // Do nothing for base Event Handler
    }

    move(dx, dy) {
        this.performAction(new BumpAction(this.engineRef.player, dx, dy));
    }

    warp(x, y) {
        this.performAction(new WarpAction(this.engineRef.player, x, y));
    }

    wait() {
        this.performAction(new WaitAction(this.engineRef.player));
    }

    pickup() {
        this.performAction(new PickupAction(this.engineRef.player));
    }

    dropItem(inventorySlot) {
        this.performAction(new DropItemAction(this.engineRef.player, inventorySlot));
    }

    performAction(action) {
        if (this.engineRef.player) {
            var actionResult = action.perform(false);
            if (actionResult.success) {
                var scene = this.engineRef.scene;
                scene.socket.emit('s-performAction', {roomId: scene.room.roomId, playerId: scene.socket.id, actionData: actionResult.action.toString()});
            }
        }
    }

    zoom(zoomLevel) {
        if (zoomLevel == 1) { // Zoom In
            if (this.engineRef.zoomLevel < 2) {
                this.engineRef.zoomLevel ++;
            }
        } else if (zoomLevel == -1) { // Zoom Out
            if (this.engineRef.zoomLevel > -1) {
                this.engineRef.zoomLevel --;
            }
        }

        var zoom;
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
        var scene = this.engineRef.scene;
        var player = this.engineRef.player;
        this.performAction(new DebugAction(this.engineRef.player));
        player.energy = 5000;
        player.energyMax = 5000;
        this.engineRef.debugEnabled = true;
        scene.events.emit('ui-updateEnergy', {energy: player.energy, energyMax: player.energyMax });
        scene.socket.emit('updateEnergy', { roomId: scene.room.roomId, playerId: scene.socket.id, energy: player.energy, energyMax: player.energyMax });
    }

    addEnergy() {
        var scene = this.engineRef.scene;
        var player = this.engineRef.player;
        player.energy = 5000;
        player.energyMax = 5000;
        scene.events.emit('ui-updateEnergy', {energy: player.energy, energyMax: player.energyMax });
        scene.socket.emit('updateEnergy', { roomId: scene.room.roomId, playerId: scene.socket.id, energy: player.energy, energyMax: player.energyMax});
    }

   debugRoom() {
        self.socket.emit('s-createDebugRoom', { roomId: self.room.roomId, playerId: self.socket.id });
    }
}

export class MainGameEventHandler extends EventHandler {
    constructor(input, engine) {
        super(input, engine);
    }

    pressKey(event) {
        var self = this;

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
                this.engineRef.eventHandler = new InventoryActivateEventHandler(this.engineRef.scene.input, this.engineRef);
                break;
            case "KeyD":
                this.engineRef.eventHandler = new InventoryDropEventHandler(this.engineRef.scene.input, this.engineRef);
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
            case "PageDown":
                console.log('Entering Debug Room...');
                self.debugRoom();
            default:
                break;
        }
    }

    mouseMove(event) {
        var self = this;

        var gameMap = self.engineRef.gameMap;
        var x = Math.floor((event.worldX - gameMap.offsetWidth) / Tilemaps.getTileMap().frameWidth);
        var y = Math.floor((event.worldY - gameMap.offsetHeight) / Tilemaps.getTileMap().frameHeight);

        var sidePanel = self.engineRef.sidePanel;
        if (gameMap.locations[x] && gameMap.locations[x][y]) {
            sidePanel.text("Looking at [" + x + "][" + y + "]:\n");
            var entity = gameMap.getBlockingEntityAtLocation(x, y);

            if (entity) {
                sidePanel.text(entity.name + "\n", "#" + entity.sprite.color);
                sidePanel.text(entity.description + "\n\n");
            }

            var tiles = gameMap.locations[x][y].tiles;
            for (var i = 0; i < tiles.length; i++) {
                var tile = tiles[i];
                sidePanel.text(tile.name + "\n");
                sidePanel.text(tile.description + "\n\n");
            }

            sidePanel.build();
        } else {
            sidePanel.text("").build();
        }
    }
}

export class PlayerDeadEventHandler extends EventHandler {
    constructor(input, engine) {
        super(input, engine);
    }

    pressKey(event) {

    }
}

export class AskUserEventHandler extends EventHandler {
    constructor(input, engine) {
        super(input, engine);
    }

    pressKey(event) {
        switch(event.code) {
            case "ShiftLeft":
            case "ShiftRight":
            case "ControlLeft":
            case "ControlRight":
            case "AltLeft":
            case "AltRight":
                break;
            default:
                this.exit();
                break;
        }
    }

    mouseClick(event) {
        this.exit();
    }

    exit() {
        this.engineRef.eventHandler = new MainGameEventHandler(this.engineRef.scene.input, this.engineRef);
    }
}

export class InventoryEventHandler extends AskUserEventHandler {
    constructor(input, engine) {
        super(input, engine);

        this.title = "<missing title>";
    }

    render() {
        this.engineRef.inventoryMenu.show();

        var items = this.engineRef.player.inventory.items;
        var itemsLength = items.length;
        if (itemsLength == 0) {
            this.engineRef.inventoryMenu.text("(Empty)");
        } else {
            for (var i = 0; i < itemsLength; i++) {
                var itemKey = String.fromCharCode(65 + i);
                var itemLine = "(" + itemKey + ") " + items[i].name;
                this.engineRef.inventoryMenu.text(itemLine + "\n");
            }
        }

        this.engineRef.inventoryMenu.build();
    }

    pressKey(event) {
        var player = this.engineRef.player;
        var charAKeyCode = 65;
        var index = event.keyCode - 65;

        if (index >= 0 && index < 26) {
            var selectedItem = player.inventory.items[index];
            if (selectedItem) {
                this.selectItem(index, selectedItem);
                return;
            }
        }

        super.pressKey(event);
    }

    selectItem(index, item) {
        // Do nothing for base InventoryEventHandler
    }

    exit() {
        this.engineRef.inventoryMenu.hide();
        super.exit();
    }
}

export class InventoryActivateEventHandler extends InventoryEventHandler {
    constructor(input, engine) {
        super(input, engine);

        this.title = "Select an item to use";
        this.render();
    }

    selectItem(index, item) {
        this.performAction(item.consumable.getAction(this.engineRef.player, index));
    }
}

export class InventoryDropEventHandler extends InventoryEventHandler {
    constructor(input, engine) {
        super(input, engine);

        this.title = "Select an item to drop";
        this.render();
    }

    selectItem(index, item) {
        this.dropItem(index);
    }
}
