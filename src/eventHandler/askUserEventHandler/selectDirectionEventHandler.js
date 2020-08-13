import AskUserEventHandler from "./_askUserEventHandler";

export default class SelectDirectionHandler extends AskUserEventHandler {
    constructor(engine, validTargets, callback) {
        super(engine);
        const player = this.engineRef.player;
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
        let dx = 0;
        let dy = 0;
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

        if (dx !== 0 || dy !== 0) {
            this.selectDirection(dx, dy);
        } else {
            super.pressKey(event);
        }
    }

    highlightTargets() {
        if (this.validTargets) {
            for (let i = 0; i < this.validTargets.length; i++) {
                const target = this.validTargets[i];

                if (this.engineRef.gameMap.highlight[target.x] && this.engineRef.gameMap.highlight[target.x][target.y]) {
                    this.engineRef.gameMap.highlight[target.x][target.y].setVisible(true);
                }
            }
        }
    }

    clearHighlight() {
        if (this.validTargets) {
            for (let i = 0; i < this.validTargets.length; i++) {
                const target = this.validTargets[i];

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
        this.performAction(this.callback(dx, dy, this.x + dx, this.y + dy));
        this.exit();
    }

    exit() {
        this.clearHighlight();

        super.exit();
    }
}