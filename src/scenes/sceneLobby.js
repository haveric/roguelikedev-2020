import Phaser from "phaser";
import io from "socket.io-client";
import tilemapCurses from "../assets/Curses_square_24.png";

var socket;

export class SceneLobby extends Phaser.Scene {
    constructor() {
        super("SceneLobby");
    }

    preload() {
        this.load.json("config", "/config/config.json");
        this.load.spritesheet("tilemap", tilemapCurses, {
            frameWidth: 24,
            frameHeight: 24
        });
    }

    create() {
        var self = this;

        var config = this.cache.json.get("config");
        socket = io(config.protocol + config.server + ":" + config.port);

        var lobbyStatsStyle = { font: "22px Arial", fill: "#fff"};
        this.lobbyCount = this.add.text(20, 50, "Lobby: 0", lobbyStatsStyle);
        this.roomCount = this.add.text(20, 80, "Rooms: 0", lobbyStatsStyle);
        this.playerCount = this.add.text(20, 110, "- Players: 0", lobbyStatsStyle);
        this.spectatorCount = this.add.text(20, 140, "- Spectators: 0", lobbyStatsStyle);

        // Logo
        var title = this.add.text(0, 0, "Tethered", {font: "48px Arial", fill: "#fff"}).setOrigin(0.5);
        this.rexUI.add.label({
            anchor: {
                centerX: "center"
            },
            y: 50,
            text: title
        }).layout();

        var buttons = this.rexUI.add.buttons({
            anchor: {
                centerX: "center"
            },
            y: 200,
            width: 300,
            space: 20,
            orientation: "y",
            buttons: [
                createButton(this, "Start Game"),
                createButton(this, "Join Game")
            ],
            expand: true
        }).layout();

        self.joinDialog = undefined;

        buttons.on("button.click", function (button, index/*, pointer, event*/) {
            if (index == 0) {
                var playerName;
                var initialPlayerName = localStorage.getItem("playerName");
                if (initialPlayerName) {
                    playerName = initialPlayerName;
                } else {
                    playerName = "Player 1";
                }
                socket.emit("createRoom", playerName);
            } else if (index == 1) {
                self.joinDialog = createJoinDialog(self);
            }
        });

        socket.on("lobbyUpdate", function(lobbyStats) {
            self.lobbyCount.setText("Lobby: " + lobbyStats.numUsers);
            self.roomCount.setText("Rooms: " + lobbyStats.numRooms);
            self.playerCount.setText("- Players: " + lobbyStats.playersInRooms);
            self.spectatorCount.setText("- Spectators: " + lobbyStats.spectatorsInRooms);
        });

        socket.on("roomJoin", function(room) {
            self.scene.start("SceneSetup", {room: room, socket: this});
        });

        socket.on("startSpectatingGame", function(room) {
            self.scene.start("SceneGameUI");
            self.scene.start("SceneGame", {room: room, socket: this});
        });

        self.events.on("shutdown", function() {
            socket.off("lobbyUpdate");
            socket.off("roomJoin");
            socket.off("startSpectatingGame");
        });
    }

    buttonHoverState(button) {
        button.setFill("#ff0");
    }

    buttonRestState(button) {
        button.setFill("#fff");
    }

    buttonActiveState(button) {
        button.setFill("#0ff");
    }
}


var createButton = function (scene, text) {
    return scene.rexUI.add.label({
        width: 40,
        height: 40,
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x7b5e57),
        text: scene.add.text(0, 0, text, {
            fontSize: 18
        }),
        space: {
            left: 10,
            right: 10,
        },
        align: "center"
    });
};

var createJoinDialog = function (scene) {
    if (scene.joinDialog) {
        scene.rexUI.show(scene.joinDialog);
    } else {
        var roomId = "";
        var title = "Room ID";
        var y = 300;

        var background = scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x4e342e);
        var titleField = scene.add.text(0, 0, title);
        var roomIdField = scene.rexUI.add.label({
            orientation: "x",
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, 0x7b5e57),
            text: scene.rexUI.add.BBCodeText(0, 0, roomId, { fixedWidth: 180, fixedHeight: 36, valign: "center" }),
            space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10, }
        }).setInteractive()
        .on("pointerdown", function () {
            var config = {
                onTextChanged: function(textObject, text) {
                    roomId = text;
                    textObject.text = text;
                    scene.joinDialogErrorField.setText("");
                }
            };
            scene.rexUI.edit(roomIdField.getElement("text"), config);
        });

        var joinButton = scene.rexUI.add.label({
            orientation: "x",
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x7b5e57),
            text: scene.add.text(0, 0, "Join"),
            space: { top: 8, bottom: 8, left: 8, right: 8 }
        })
        .setInteractive()
        .on("pointerdown", function () {
            joinDialog.emit("join", roomId);
        });

        var cancelButton = scene.rexUI.add.label({
            orientation: "x",
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x7b5e57),
            text: scene.add.text(0, 0, "Cancel"),
            space: { top: 8, bottom: 8, left: 8, right: 8 }
        })
        .setInteractive()
        .on("pointerdown", function () {
            joinDialog.emit("cancel", roomId);
        });

        var buttons = scene.rexUI.add.sizer({
            orientation: "x"
        })
        .add(cancelButton, 0, "right", { bottom: 10, left: 10, right: 10 }, false)
        .add(joinButton, 0, "right", { bottom: 10, left: 10, right: 10 }, false)
        .layout();

        scene.joinDialogErrorField = scene.add.text(0, 0, " ");
        var joinDialog = scene.rexUI.add.sizer({
            orientation: "y",
            anchor: {
                centerX: "center"
            },
            y: y
        })
        .addBackground(background)
        .add(titleField, 0, "center", { top: 10, bottom: 10, left: 10, right: 10 }, false)
        .add(roomIdField, 0, "left", { bottom: 10, left: 10, right: 10 }, true)
        .add(scene.joinDialogErrorField, 0, "left", { bottom: 10, left: 10, right: 10 }, false)
        .add(buttons, 0, "right")
        .layout();

        joinDialog.on("join", function(/*button, groupName, index*/) {
            var playerName;
            var initialPlayerName = localStorage.getItem("playerName");
            if (initialPlayerName) {
                playerName = initialPlayerName;
            } else {
                playerName = "Player 2";
            }
            socket.emit("joinRoom", { roomId: roomId, playerName: playerName } );
        }).on("cancel", function(/*button, groupName, index*/) {
            scene.joinDialogErrorField.setText("");
            scene.rexUI.hide(this);
        });

        socket.on("roomJoinFailed", function(message) {
            console.log("Error Message: ", message);
            scene.joinDialogErrorField.setText(message);
        });
    }
    return joinDialog;
};