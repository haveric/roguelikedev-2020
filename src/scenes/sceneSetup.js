export class SceneSetup extends Phaser.Scene {
    constructor() {
        super('SceneSetup');
    }

    init(data) {
        this.room = data.room;
        this.socket = data.socket;
        this.tilemap = {
            name: "tilemap",
            frameWidth: 24,
            frameHeight: 24,
            tiles: {
                "@": 64
            }
        }
    }

    preload() {
        this.load.spritesheet('tilemap', "/src/assets/Curses_square_24.png", {
            frameWidth: 24,
            frameHeight: 24
        });
    }

    create() {
        var self = this;
        self.add.text(400, 50, "Setup", {font: "48px Arial", fill: "#fff"}).setOrigin(0.5);

        self.roomText = self.add.text(20, 20, "Room Id: " + self.room.roomId, {font: "24px Arial", fill: "#fff"});

        createPlayerLoaders(self, 2);

        for (var i = 0; i < self.room.players.length; i++) {
            var player = self.room.players[i];
            createPlayerSelectorFromLoader(self, player);
        }

        self.socket.on('roomAddPlayer', function(player) {
            console.log("Add Player");
            createPlayerSelectorFromLoader(self, player);
        });

        self.socket.on('roomUpdatePlayer', function(data) {
            console.log("Room Update Player");

            if (data.player && data.player.playerId != self.socket.id) {
                var playerId = data.player.playerId;

                for (var i = 0; i < self.playerSelectors.length; i++) {
                    var playerSelector = self.playerSelectors[i];

                    if (playerSelector.playerId == playerId) {
                        playerSelector.children[1].setText(data.player.name);

                        playerSelector.children[2].setTint("0x" + data.player.color);

                        var button = playerSelector.children[3].buttons[0];
                        var icon = button.getElement('icon');
                        var text = button.getElement('text');

                        if (data.player.ready) {
                            icon.setFillStyle(COLOR_LIGHT);
                            text.setText("Ready");
                        } else {
                            icon.setFillStyle(undefined);
                            text.setText("Ready?");
                        }
                    }
                }
            }

            if (data.allPlayersReady != null) {
                if (data.initialPlayerId == self.socket.id) {
                    if (!self.startGameButton) {
                        self.startGameButton = createStartGameButton(self, "Start Game!");
                    }

                    if (data.allPlayersReady) {
                        self.rexUI.show(self.startGameButton);
                    } else {
                        self.rexUI.hide(self.startGameButton);
                    }
                }
            }
        });

        self.socket.on('startGame', function(room) {
            self.scene.start('SceneGame', {room: room, socket: this});
        });
    }
}

var getFrameOf = function(scene, sprite, iconFallback, bgIcon) {
    var frame = null;
    var bgFrame = null;
    var drawBackground = true;
    if (scene.tilemap.tiles[sprite]) {
        frame = scene.tilemap.tiles[sprite];
        drawBackground = false;
    } else if (scene.tilemap.tiles[iconFallback]) {
        frame = scene.tilemap.tiles[iconFallback];
    }

    if (drawBackground && scene.tilemap.tiles[bgIcon]) {
        bgFrame = scene.tilemap.tiles[bgIcon];
    }

    if (frame == null && bgFrame == null) {
        console.log("Tilemap missing sprites! " + sprite + ", " + iconFallback + ", " + bgIcon);
    }

    return {frame: frame, bgFrame: bgFrame };
}

var createPlayerLoaders = function(scene, numPlayers) {
    for (var i = 0; i < numPlayers; i++) {
        createPlayerLoader(scene, i);
    }
}

var createPlayerLoader = function(scene, index) {
    var x = 100 * (index + 1) + (250 * index);
    var y = 150;
    var width = 250;
    var height = 300;

    var background = scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x4e342e);
    var titleField = scene.add.text(0, 0, "Waiting on Player...");

    var playerLoader = scene.rexUI.add.sizer({
        orientation: 'y',
        x: x,
        y: y,
        width: width,
        height: height
    })
    .setOrigin(0)
    .addBackground(background)
    .add(titleField, 0, 'center', { top: 135, bottom: 10, left: 10, right: 10 }, false)
    .layout();

    if (!scene.playerLoaders) {
        scene.playerLoaders = [];
    }

    scene.playerLoaders.push(playerLoader);
}

var createPlayerSelectorFromLoader = function(scene, player) {
    if (!scene.playerSelectors) {
        scene.playerSelectors = [];
    }

    for (var i = 0; i < scene.playerLoaders.length; i++) {
        var playerLoader = scene.playerLoaders[i];

        // If open slot, add player
        if (scene.playerSelectors.length == i) {
            createPlayerSelector(scene, i, player);
            scene.rexUI.hide(playerLoader);
            break;
        }
    }
}

var createPlayerSelector = function(scene, index, player) {
    var x = 100 * (index + 1) + (250 * index);
    var y = 150;
    var width = 250;
    var height = 300;

    var background = scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x4e342e);
    var playerSelector = scene.rexUI.add.sizer({
        orientation: 'y',
        x: x,
        y: y,
        width: width,
        height: height
    })
    .setOrigin(0)
    .addBackground(background);

    var isCurrentPlayer = player.playerId == scene.socket.id;
    if (isCurrentPlayer) {
        var playerNameField = scene.rexUI.add.label({
            orientation: 'x',
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, 0x7b5e57),
            text: scene.rexUI.add.BBCodeText(0, 0, player.name, { fixedWidth: 180, fixedHeight: 36, valign: 'center' }),
            space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10, }
        }).setInteractive()
        .on('pointerdown', function () {
            var config = {
                onTextChanged: function(textObject, text) {
                    player.name = text;
                    textObject.text = text;
                    scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, name: player.name });
                }
            }
            scene.rexUI.edit(playerNameField.getElement('text'), config);
        });

        playerSelector.add(playerNameField, 0, 'left', { top: 10, bottom: 10, left: 10, right: 10 }, true)
    } else {
        var playerField = scene.add.text(0, 0, player.name);
        playerSelector.add(playerField, 0, 'left', { top: 26, bottom: 20, left: 15, right: 10 }, false);
    }


    var frame = getFrameOf(scene, player.sprite, player.icon).frame;

    if (frame != null) {
        var playerSprite = scene.add.sprite(0, 0, scene.tilemap.name).setFrame(frame).setTint("0x" + player.color);
        playerSprite.displayWidth = 100;
        playerSprite.scaleY = playerSprite.scaleX; // scale evenly
        playerSelector.add(playerSprite, 0, 'center', { top: 28, bottom: 20, left: 10, right: 10 }, false);
    }

    var CheckboxesMode = true;
    var btns = [];
    btns.push(createButton(scene, "Ready? ", isCurrentPlayer));
    var buttons = scene.rexUI.add.fixWidthButtons({
        x: 0, y: 0,
        width: 80,
        buttons: btns,
        space: {
            left: 10, right: 10, top: 20, bottom: 20,
            line: 10, item: 10
        },
        type: ((CheckboxesMode) ? 'checkboxes' : 'radio'),
        setValueCallback: function (button, value) {
            if (isCurrentPlayer) {
                button.getElement('icon').setFillStyle((value) ? COLOR_LIGHT : undefined);
                scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, ready: value });
            }
        }
    });
    playerSelector.add(buttons, 0, 'right', { top: 10, bottom: 10, left: 10, right: 10 }, false);


    if (isCurrentPlayer) {
        // TODO: Color
    }

    playerSelector.layout();


    playerSelector.playerId = player.playerId;

    scene.playerSelectors.push(playerSelector);
}

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;
var createButton = function (scene, text, isCurrentPlayer) {
    var background = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10);
    if (isCurrentPlayer) {
        background.setStrokeStyle(2, COLOR_LIGHT);
    }
    return scene.rexUI.add.label({
        background: background,
        icon: scene.add.circle(0, 0, 10).setStrokeStyle(1, COLOR_DARK),
        text: scene.add.text(0, 0, text, {
            fontSize: 18
        }),
        space: {
            left: 10, right: 10, top: 10, bottom: 10,
            icon: 10
        },
        align: 'center',
        name: text
    });
}

var createStartGameButton = function(scene, text) {
    var background = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10);
    background.setStrokeStyle(2, COLOR_LIGHT);
    var startButton = scene.rexUI.add.label({
        x: 0, y: 0,
        background: background,
        text: scene.add.text(0, 0, text, {
            fontSize: 18
        }),
        space: {
            left: 10, right: 10, top: 10, bottom: 10,
            icon: 10
        },
        align: 'center',
        name: text
    });

    var btns = [];
    btns.push(startButton);
    var buttons = scene.rexUI.add.buttons({
        x: 400, y: 525,
        width: 80,
        buttons: btns,
        space: {
            left: 10, right: 10, top: 20, bottom: 20,
            line: 10, item: 10
        }
    }).layout();

    buttons.on("button.click", function(button, index, pointer, event) {
        scene.socket.emit('startGame', { roomId: scene.room.roomId, playerId: scene.socket.id } );
    });

    return buttons;
}
/*
var createPlayerSelectorOld = function(scene, player) {
    var roomId = "";
    var x = 400;
    var y = 300;

    var background = scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x4e342e);
    var roomIdField = scene.rexUI.add.label({
        orientation: 'x',
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, 0x7b5e57),
        text: scene.rexUI.add.BBCodeText(0, 0, roomId, { fixedWidth: 180, fixedHeight: 36, valign: 'center' }),
        space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10, }
    }).setInteractive()
    .on('pointerdown', function () {
        var config = {
            onTextChanged: function(textObject, text) {
                roomId = text;
                textObject.text = text;
                scene.joinDialogErrorField.setText("");
            }
        }
        scene.rexUI.edit(roomIdField.getElement('text'), config);
    });

    var joinButton = scene.rexUI.add.label({
        orientation: 'x',
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x7b5e57),
        text: scene.add.text(0, 0, 'Join'),
        space: { top: 8, bottom: 8, left: 8, right: 8 }
    })
    .setInteractive()
    .on('pointerdown', function () {
        joinDialog.emit('join', roomId);
    });

    var cancelButton = scene.rexUI.add.label({
        orientation: 'x',
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x7b5e57),
        text: scene.add.text(0, 0, 'Cancel'),
        space: { top: 8, bottom: 8, left: 8, right: 8 }
    })
    .setInteractive()
    .on('pointerdown', function () {
        joinDialog.emit('cancel', roomId);
    });

    var buttons = scene.rexUI.add.sizer({
        orientation: 'x'
    })
    .add(cancelButton, 0, 'right', { bottom: 10, left: 10, right: 10 }, false)
    .add(joinButton, 0, 'right', { bottom: 10, left: 10, right: 10 }, false)
    .layout();

    scene.joinDialogErrorField = scene.add.text(0, 0, " ");
    var joinDialog = scene.rexUI.add.sizer({
        orientation: 'y',
        x: x,
        y: y
    })
    .addBackground(background)
    .add(roomIdField, 0, 'left', { bottom: 10, left: 10, right: 10 }, true)
    .add(scene.joinDialogErrorField, 0, 'left', { bottom: 10, left: 10, right: 10 }, false)
    .add(buttons, 0, 'right')
    .layout();

    joinDialog.on('join', function(button, groupName, index) {
        var playerName;
        var initialPlayerName = localStorage.getItem("playerName");
        if (initialPlayerName) {
            playerName = initialPlayerName;
        } else {
            playerName = "Player 2";
        }
        socket.emit('joinRoom', { roomId: roomId, playerName: playerName } );
    }).on('cancel', function(button, groupName, index) {
        scene.joinDialogErrorField.setText("");
        scene.rexUI.hide(this);
    });

    socket.on('roomJoinFailed', function(message) {
        console.log("Error Message: ", message);
        scene.joinDialogErrorField.setText(message);
    });
}
*/