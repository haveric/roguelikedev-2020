import { BumpAction } from './actions.js';

export default class EventHandler extends Phaser.Events.EventEmitter {
    constructor(keyboard) {
        super();
        var self = this;

        this.keyboard = keyboard;
        this.keysDown = [];

        this.keyboard.on('keydown', function(event) {
            if (!self.keysDown[event.code]) {
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
                        self.move(0, 0);
                        break;
                    case "Minus":
                        self.zoom(-1);
                        break;
                    case "Equal":
                        self.zoom(1);
                        break;
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
        this.emit('action', new BumpAction(dx, dy));
    }

    zoom(zoomLevel) {
        this.emit('zoom', zoomLevel);
    }
}