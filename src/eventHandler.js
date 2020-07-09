import { BumpAction, WaitAction, WarpAction } from './actions';

export default class EventHandler extends Phaser.Events.EventEmitter {
    constructor(keyboard, engine) {
        super();
        this.engineRef = engine;
        var self = this;

        this.debugEnabled = false;
        this.keyboard = keyboard;
        this.keysDown = [];

        this.keyboard.on('keydown', function(event) {
            if (self.debugEnabled || !self.keysDown[event.code]) {
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

            self.keysDown[event.code] = 1;
        });

        this.keyboard.on('keyup', function(event) {
            self.keysDown[event.code] = 0;
        });
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
