import AskUserEventHandler from "../_askUserEventHandler";

export default class SelectIndexHandler extends AskUserEventHandler {
    constructor(engine) {
        super(engine);

        const player = this.engineRef.player;
        this.x = player.x;
        this.y = player.y;
        this.lastX = this.x;
        this.lastY = this.y;
        this.highlightTile(this.x, this.y, true);
    }

    pressKey(event) {
        let modifier = 1;

        if (event.shiftKey || event.numLockShiftKey) {
            modifier *= 5;
        }

        if (event.ctrlKey) {
            modifier *= 10;
        }

        if (event.altKey) {
            modifier *= 20;
        }

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
            this.lastX = this.x;
            this.lastY = this.y;
            this.x += dx * modifier;
            this.y += dy * modifier;

            const gameMap = this.engineRef.gameMap;
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

    mouseClick(/*event*/) {
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