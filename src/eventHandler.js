import { BumpAction, WaitAction, PickupAction, WarpAction } from './actions';
import Tilemaps from './tilemaps';

export class EventHandler extends Phaser.Events.EventEmitter {
    constructor(input, engine) {
        super();
        this.engineRef = engine;
        var self = this;

        this.debugEnabled = false;
        this.input = input;
        this.keysDown = [];

        this.input.keyboard.on('keydown', function(event) {
            if (self.debugEnabled || !self.keysDown[event.code]) {
                self.pressKey(event.code);
            }

            self.keysDown[event.code] = 1;
        });

        this.input.keyboard.on('keyup', function(event) {
            self.keysDown[event.code] = 0;
        });

        this.input.on('pointermove', function(event) {
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
        });
    }

    killEvents() {
        this.input.keyboard.off('keydown');
        this.input.keyboard.off('keyup');
    }

    pressKey(eventCode) {
        // Do nothing for base Event Handler
    }

    move(dx, dy) {
        this.emit('action', new BumpAction(this.engineRef.player, dx, dy));
    }

    warp(x, y, entity) {
        entity = entity || this.engineRef.player;
        this.emit('action', new WarpAction(entity, x, y));
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

    pressKey(eventCode) {
        var self = this;

        switch (eventCode) {
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
}

export class PlayerDeadEventHandler extends EventHandler {
    constructor(input, engine) {
        super(input, engine);
    }

    pressKey(eventCode) {

    }
}

export class AskUserEventHandler extends EventHandler {
    constructor(input, engine) {
        super(input, engine);
    }

    exit() {
        this.engineRef.eventHandler.killEvents();
        this.engineRef.eventHandler = new MainGameEventHandler(engine.scene.input, engine);
    }
}

export class InventoryEventHandler extends AskUserEventHandler {
    constructor(input, engine) {
        super(input, engine);
    }

    pressKey(eventCode) {

        this.exit();
    }

}