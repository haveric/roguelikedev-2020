import { BumpAction, WaitAction, PickupAction, WarpAction } from './actions';
import Tilemaps from './tilemaps';

export class EventHandler extends Phaser.Events.EventEmitter {
    constructor(input, engine) {
        super();
        this.engineRef = engine;

        this.debugEnabled = false;
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

        this.input.off('pointerclick').on('pointerclick', function(event) {
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
        this.emit('action', new BumpAction(this.engineRef.player, dx, dy));
    }

    warp(x, y) {
        this.emit('action', new WarpAction(this.engineRef.player, x, y));
    }

    wait() {
        this.emit('action', new WaitAction(this.engineRef.player));
    }

    pickup() {
        this.emit('action', new PickupAction(this.engineRef.player));
    }

    zoom(zoomLevel) {
        this.emit('zoom', zoomLevel);
    }

    debug() {
        this.emit('debug', 1);
    }

    addEnergy() {
        this.emit('addEnergy', 1);
    }

    debugRoom() {
        this.emit('debugRoom', 1);
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
            case "KeyA":
            case "ArrowLeft":
            case "Numpad4":
                self.move(-1, 0);
                break;
            // Right
            case "KeyD":
            case "ArrowRight":
            case "Numpad6":
                self.move(1, 0);
                break;
            // Up
            case "KeyW":
            case "ArrowUp":
            case "Numpad8":
                self.move(0, -1);
                break;
            // Down
            case "KeyS":
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
        var items = this.engineRef.player.inventory.items;
        var itemsLength = items.length;
        if (itemsLength == 0) {
            // TODO: display "(Empty)"
        } else {
            for (var i = 0; i < itemsLength; i++) {
                var itemKey = 'a' + i;
                var itemLine = "(" + itemKey + ") " + items[i].name;
                // TODO: display itemLine
            }
        }
    }

    pressKey(eventCode) {

    }
}