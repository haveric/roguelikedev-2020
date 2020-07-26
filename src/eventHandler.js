import { BumpAction, WaitAction, PickupAction, WarpAction, DropItemAction, DebugAction, OpenAction, CloseAction } from './actions';
import Tilemaps from './tilemaps';

export class EventHandler {
    constructor(input, engine) {
        this.engineRef = engine;

        this.input = input;
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
        var self = this;
        this.input.keyboard.off('keydown').on('keydown', function(event) {
            var numLockOn = event.getModifierState('NumLock');
            if (numLockOn && !event.shiftKey && event.code.startsWith("Numpad") && event.keyCode < 90) {
                event.numLockShiftKey = true;
            }
            if (self.debugEnabled || !self.keysDown[event.code]) {
                self.pressKey(event);
            }

            self.addKey(event.code);
        });

        this.input.keyboard.off('keyup').on('keyup', function(event) {
            self.removeKey(event.code);
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

    getTileXFromWorldX(worldX) {
        return Math.floor((worldX - this.engineRef.gameMap.offsetWidth) / Tilemaps.getTileMap().frameWidth);
    }

    getTileYFromWorldY(worldY) {
        return Math.floor((worldY - this.engineRef.gameMap.offsetHeight) / Tilemaps.getTileMap().frameHeight);
    }

    updateSidePanelDescriptionsForWorldPosition(worldX, worldY) {
        var x = this.getTileXFromWorldX(worldX);
        var y = this.getTileYFromWorldY(worldY);

        this.updateSidePanelDescriptionsForTile(x, y);
    }

    updateSidePanelDescriptionsForTile(x, y, skipBlocking) {
        var gameMap = this.engineRef.gameMap;
        var sidePanel = this.engineRef.ui.sidePanel;
        if (gameMap.locations[x] && gameMap.locations[x][y]) {
            sidePanel.text("Looking at [" + x + "][" + y + "]:\n");
            if (!skipBlocking) {
                var entity = gameMap.getBlockingEntityAtLocation(x, y);
                if (entity) {
                    sidePanel.text(entity.name + "\n", "#" + entity.sprite.color);
                    sidePanel.text(entity.description + "\n\n");
                }
            }

            var entities = gameMap.getNonBlockingEntitiesAtLocation(x, y);
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                sidePanel.text(entity.name + "\n", "#" + entity.sprite.color);
                if (entities.length == 1) {
                    sidePanel.text(entity.description + "\n\n");
                }
            }
            if (entities.length > 1) {
                sidePanel.text("\n");
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
        if (action && this.engineRef.player) {
            var actionResult = action.perform(false);
            if (actionResult.success) {
                var scene = this.engineRef.scene;
                scene.socket.emit('s-performAction', {roomId: scene.room.roomId, playerId: scene.socket.id, useEnergy: actionResult.useEnergy, actionData: actionResult.action.toString()});
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
        scene.socket.emit('updateEnergy', { roomId: scene.room.roomId, playerId: scene.socket.id, energy: player.energy, energyMax: player.energyMax, giveEnergy: false});
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
        var scene = this.engineRef.scene;
        scene.socket.emit('s-createDebugRoom', { roomId: scene.room.roomId, playerId: scene.socket.id });
    }

    regenMap() {
        var scene = this.engineRef.scene;
        scene.socket.emit('s-regenMap', { roomId: scene.room.roomId });
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
            case "KeyO":
                var player = this.engineRef.player;
                var targets = [];

                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        if (i != 0 || j != 0) {
                            var x = player.x + i;
                            var y = player.y + j;
                            var success = this.engineRef.gameMap.locations[x][y].tileComponentCheck("openable", "getIsOpen");
                            if (success === false) {
                                targets.push({"x": x, "y": y});
                            }
                        }
                    }
                }

                this.engineRef.eventHandler = new SelectDirectionHandler(this.engineRef.scene.input, this.engineRef, targets, function(dx, dy) {
                    return new OpenAction(player, dx, dy);
                });
                break;
            case "KeyC":
                var player = this.engineRef.player;
                var targets = [];

                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        if (i != 0 || j != 0) {
                            var x = player.x + i;
                            var y = player.y + j;
                            if (this.engineRef.gameMap.locations[x][y].tileComponentCheck("openable", "getIsOpen")) {
                                targets.push({"x": x, "y": y});
                            }
                        }
                    }
                }

                this.engineRef.eventHandler = new SelectDirectionHandler(this.engineRef.scene.input, this.engineRef, targets, function(dx, dy) {
                    return new CloseAction(player, dx, dy);
                });
                break;
            case "Backslash":
                this.engineRef.eventHandler = new LookHandler(this.engineRef.scene.input, this.engineRef);
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
                break;
            case "PageUp":
                console.log('Regenerating map...');
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

export class PlayerDeadEventHandler extends EventHandler {
    constructor(input, engine) {
        super(input, engine);

        engine.scene.events.emit('ui-updateHp', { hp: engine.player.fighter.getHp(), hpMax: engine.player.fighter.hpMax });
        engine.ui.inventoryMenu.hide();
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
        var inventoryMenu = this.engineRef.ui.inventoryMenu;
        inventoryMenu.show();
        inventoryMenu.text(this.title + "\n\n");
        var items = this.engineRef.player.inventory.items;
        var itemsLength = items.length;
        if (itemsLength == 0) {
            inventoryMenu.text("(Empty)");
        } else {
            for (var i = 0; i < itemsLength; i++) {
                var itemKey = String.fromCharCode(65 + i);
                var itemLine = "(" + itemKey + ") " + items[i].name;
                inventoryMenu.text(itemLine + "\n");
            }
        }

        inventoryMenu.build();
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
        this.engineRef.ui.inventoryMenu.hide();
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

export class SelectDirectionHandler extends AskUserEventHandler {
    constructor(input, engine, validTargets, callback) {
        super(input, engine);
        var player = this.engineRef.player;
        this.x = player.x;
        this.y = player.y;
        this.validTargets = validTargets;
        this.callback = callback;

        if (!this.validTargets || this.validTargets.length === 0) {
            this.selectDirection(-1, -1);
        } else {
            this.highlightTargets();
        }
    }

    pressKey(event) {
        var dx = 0;
        var dy = 0;
        switch (event.code) {
            // Left
            case "ArrowLeft":
            case "Numpad4":
                dx = -1;
                break;
            // Right
            case "ArrowRight":
            case "Numpad6":
                dx = 1;
                break;
            // Up
            case "ArrowUp":
            case "Numpad8":
                dy = -1;
                break;
            // Down
            case "ArrowDown":
            case "Numpad2":
                dy = 1;
                break;
            // Northwest
            case "Numpad7":
                dx = -1;
                dy = -1;
                break;
            // Northeast
            case "Numpad9":
                dx = 1;
                dy = -1;
                break;
            // Southwest
            case "Numpad1":
                dx = -1;
                dy = 1;
                break;
            // Southeast
            case "Numpad3":
                dx = 1;
                dy = 1;
                break;
            default:
                break;
        }

        if (dx != 0 || dy != 0) {
            this.selectDirection(dx, dy);
        } else {
            super.pressKey(event);
        }
    }

    highlightTargets() {
        if (this.validTargets) {
            for (var i = 0; i < this.validTargets.length; i++) {
                var target = this.validTargets[i];

                if (this.engineRef.gameMap.highlight[target.x] && this.engineRef.gameMap.highlight[target.x][target.y]) {
                    this.engineRef.gameMap.highlight[target.x][target.y].setVisible(true);
                }
            }
        }
    }

    clearHighlight() {
        if (this.validTargets) {
            for (var i = 0; i < this.validTargets.length; i++) {
                var target = this.validTargets[i];

                if (this.engineRef.gameMap.highlight[target.x] && this.engineRef.gameMap.highlight[target.x][target.y]) {
                    this.engineRef.gameMap.highlight[target.x][target.y].setVisible(false);
                }
            }
        }
    }

    mouseMove(event) {
        this.updateSidePanelDescriptionsForWorldPosition(event.worldX, event.worldY);
    }

    selectDirection(dx, dy) {
        this.performAction(this.callback(dx, dy));
        this.exit();
    }

    exit() {
        this.clearHighlight();

        super.exit();
    }
}

export class SelectIndexHandler extends AskUserEventHandler {
    constructor(input, engine) {
        super(input, engine);

        var player = this.engineRef.player;
        this.x = player.x;
        this.y = player.y;
        this.lastX = this.x;
        this.lastY = this.y;
        this.highlightTile(this.x, this.y, true);
    }

    pressKey(event) {
        var modifier = 1;

        if (event.shiftKey || event.numLockShiftKey) {
            modifier *= 5;
        }

        if (event.ctrlKey) {
            modifier *= 10;
        }

        if (event.altKey) {
            modifier *= 20;
        }

        var dx = 0;
        var dy = 0;
        switch (event.code) {
            // Left
            case "ArrowLeft":
            case "Numpad4":
                dx = -1;
                break;
            // Right
            case "ArrowRight":
            case "Numpad6":
                dx = 1;
                break;
            // Up
            case "ArrowUp":
            case "Numpad8":
                dy = -1;
                break;
            // Down
            case "ArrowDown":
            case "Numpad2":
                dy = 1;
                break;
            // Northwest
            case "Numpad7":
                dx = -1;
                dy = -1;
                break;
            // Northeast
            case "Numpad9":
                dx = 1;
                dy = -1;
                break;
            // Southwest
            case "Numpad1":
                dx = -1;
                dy = 1;
                break;
            // Southeast
            case "Numpad3":
                dx = 1;
                dy = 1;
                break;
            default:
                break;
        }

        if (dx != 0 || dy != 0) {
            this.lastX = this.x;
            this.lastY = this.y;
            this.x += dx * modifier;
            this.y += dy * modifier;

            var gameMap = this.engineRef.gameMap;
            this.x = Math.max(0, Math.min(this.x, gameMap.width - 1));
            this.y = Math.max(0, Math.min(this.y, gameMap.height - 1));

            this.highlightTile(this.x, this.y, true);
        } else {
            switch (event.code) {
                // Enter / Confirm
                case "Enter":
                case "NumpadEnter":
                    this.selectTile();
                    break;
                case "Minus":
                    this.zoom(-1);
                    break;
                case "Equal":
                    this.zoom(1);
                    break;
                default:
                    super.pressKey(event);
                    break;
            }
        }
    }

    mouseMove(event) {
        this.updateSidePanelDescriptionsForWorldPosition(event.worldX, event.worldY);
    }

    mouseClick(event) {
        if (this.engineRef.gameMap.locations[this.x] && this.engineRef.gameMap.locations[this.x][this.y]) {
            this.selectTile();
        }
    }

    highlightTile(x, y, moveCamera) {
        this.targetX = x;
        this.targetY = y;
        this.updateSidePanelDescriptionsForTile(x, y);

        if (this.engineRef.gameMap.highlight[this.lastX] && this.engineRef.gameMap.highlight[this.lastX][this.lastY]) {
            this.engineRef.gameMap.highlight[this.lastX][this.lastY].setVisible(false);
        }

        if (this.engineRef.gameMap.highlight[x] && this.engineRef.gameMap.highlight[x][y]) {
            if (moveCamera) {
                this.engineRef.scene.updateCameraView(this.engineRef.gameMap.highlight[x][y].sprite.spriteObject);
            }
            this.engineRef.gameMap.highlight[x][y].setVisible(true);
        }
    }

    clearHighlight() {
        if (this.engineRef.gameMap.highlight[this.targetX] && this.engineRef.gameMap.highlight[this.targetX][this.targetY]) {
            this.engineRef.gameMap.highlight[this.targetX][this.targetY].setVisible(false);
        }
    }

    selectTile() {
        console.error("Not implemented");
    }

    exit() {
        this.clearHighlight();
        this.engineRef.scene.updateCameraView();

        super.exit();
    }
}

export class LookHandler extends SelectIndexHandler {
    constructor(input, engine) {
        super(input, engine);
    }

    selectTile() {
        this.exit();
    }
}

export class SingleRangedAttackHandler extends SelectIndexHandler {
    constructor(input, engine, callback) {
        super(input, engine);

        this.callback = callback;
    }

    mouseMove(event) {
        this.updateSidePanelDescriptionsForWorldPosition(event.worldX, event.worldY);
        var x = this.getTileXFromWorldX(event.worldX);
        var y = this.getTileYFromWorldY(event.worldY);
        this.highlightTile(x, y, false);
        this.lastX = x;
        this.lastY = y;
    }

    selectTile() {
        this.performAction(this.callback(this.targetX, this.targetY));
        this.exit();
    }
}

export class AreaRangedAttackHandler extends SelectIndexHandler {
    constructor(input, engine, radius, callback) {
        super(input, engine);

        this.radius = radius;
        this.callback = callback;
        this.highlightTile(this.x, this.y, true);
    }

    highlightTile(x, y, moveCamera) {
        this.targetX = x;
        this.targetY = y;
        for (var i = this.lastX - this.radius + 1; i < this.lastX + this.radius; i++) {
            for (var j = this.lastY - this.radius + 1; j < this.lastY + this.radius; j++) {
                if (this.engineRef.gameMap.highlight[i] && this.engineRef.gameMap.highlight[i][j]) {
                    this.engineRef.gameMap.highlight[i][j].setVisible(false);
                }
            }
        }

        for (var i = x - this.radius + 1; i < x + this.radius; i++) {
            for (var j = y - this.radius + 1; j < y + this.radius; j++) {
                if (this.engineRef.gameMap.highlight[i] && this.engineRef.gameMap.highlight[i][j]) {
                    this.engineRef.gameMap.highlight[i][j].setVisible(true);
                }
            }
        }

        if (moveCamera && this.engineRef.gameMap.highlight[x] && this.engineRef.gameMap.highlight[x][y]) {
            this.engineRef.scene.updateCameraView(this.engineRef.gameMap.highlight[x][y].sprite.spriteObject);
        }
    }

    clearHighlight() {
        for (var i = this.targetX - this.radius; i < this.targetX + this.radius; i++) {
            for (var j = this.targetY - this.radius; j < this.targetY + this.radius; j++) {
                if (this.engineRef.gameMap.highlight[i] && this.engineRef.gameMap.highlight[i][j]) {
                    this.engineRef.gameMap.highlight[i][j].setVisible(false);
                }
            }
        }
    }

    mouseMove(event) {
        this.updateSidePanelDescriptionsForWorldPosition(event.worldX, event.worldY);
        var x = this.getTileXFromWorldX(event.worldX);
        var y = this.getTileYFromWorldY(event.worldY);
        this.highlightTile(x, y, false);
        this.lastX = x;
        this.lastY = y;
    }

    selectTile() {
        this.performAction(this.callback(this.targetX, this.targetY));
        this.exit();
    }
}