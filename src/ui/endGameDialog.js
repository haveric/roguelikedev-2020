import { COLORS } from "../constants/colors";

export default class EndGameDialog {
    constructor(ui) {
        this.ui = ui;
        this.scene = ui.scene;
    }

    showDialog(title, text) {
        this._createDialog(title, text);
    }

    hideDialog() {
        if(this.dialog) {
            this.dialog.scaleDownDestroy(100);
        }
    }

    updateText(text) {
        this.dialog.getElement("content").setText(text);
    }

    _createLabel(text) {
        const self = this;
        return this.scene.rexUI.add.label({
            width: 40, // Minimum width of round-rectangle
            height: 40, // Minimum height of round-rectangle

            background: self.scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, COLORS.LIGHT_BROWN),

            text: self.scene.add.text(0, 0, text, {
                fontSize: "24px"
            }),

            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    }

    _createDialog(title, text) {
        const self = this;
        if(self.dialog) {
            this.dialog.scaleDownDestroy(1);
        }
        this.dialog = this.scene.rexUI.add.dialog({
            anchor: {
                centerX: "center",
                centerY: "center"
            },

            background: self.scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, COLORS.UGLY_BROWN),

            title: self._createLabel(title).setDraggable(),

            content: self._createLabel(text),

            actions: [
                self._createLabel("Restart"),
                // self._createLabel("Return to Lobby") TODO: Re-add once return to lobby works for scenes
            ],

            space: {
                left: 20,
                right: 20,
                top: -20,
                bottom: -20,

                title: 25,
                titleLeft: 30,
                content: 25,
                description: 25,
                descriptionLeft: 20,
                descriptionRight: 20,
                choices: 25,

                toolbarItem: 5,
                choice: 15,
                action: 15,
            },

            expand: {
                title: false
            },

            align: {
                title: "center",
                actions: "center",
            },

            click: {
                mode: "release"
            }
        })
        .layout()
        .popUp(500);

        this.dialog.on("button.click", function (button, groupName, index) {
            const gameScene = this.ui.engine.scene;
            if (index === 0) {
                if (button.text === "Restart") {
                    button.setText("Waiting...");
                    button.width = 150;
                    gameScene.socket.emit("s-endGameVoteRestart", { roomId: gameScene.room.roomId, playerId: this.ui.engine.player.playerId});
                }
            }/* else if (index === 1) {
                gameScene.socket.emit("s-endGameReturnToLobby", { roomId: gameScene.room.roomId});
            }*/ //TODO: Re-add once return to lobby works for scenes
        }, this)
        .on("button.over", function (button) {
            button.getElement("background").setStrokeStyle(1, 0xffffff);
        })
        .on("button.out", function (button) {
            button.getElement("background").setStrokeStyle();
        });
    }
}