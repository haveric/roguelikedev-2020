import { getFrameOf, hexToRgb } from '../../utils.js';
import Tilemaps from '../tilemaps.js';

export class SceneSetup extends Phaser.Scene {
    constructor() {
        super('SceneSetup');
    }

    init(data) {
        this.room = data.room;
        this.socket = data.socket;
    }

    preload() {

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
            createPlayerSelectorFromLoader(self, player);
        });

        self.socket.on('roomUpdatePlayer', function(data) {
            if (data.player && data.player.playerId != self.socket.id) {
                var playerId = data.player.playerId;

                for (var i = 0; i < self.playerSelectors.length; i++) {
                    var playerSelector = self.playerSelectors[i];

                    if (playerSelector.playerId == playerId) {
                        playerSelector.children[1].setText(data.player.name);

                        playerSelector.children[2].setTint("0x" + data.player.color);

                        var child = playerSelector.children[3];
                        var numChildren = child.children.length;
                        if (numChildren > 0) {
                            var button = child.children[numChildren-1].buttons[0];
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
            self.scene.start('SceneGameUI');
            self.scene.start('SceneGame', {room: room, socket: this});
        });

        self.events.on('shutdown', function() {
            self.socket.off('roomAddPlayer');
            self.socket.off('roomUpdatePlayer');
            self.socket.off('startGame');
        });
    }
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
        scene.playerNameField = scene.rexUI.add.label({
            orientation: 'x',
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, 0x7b5e57),
            text: scene.rexUI.add.BBCodeText(0, 0, player.name, { fixedWidth: 180, fixedHeight: 36, valign: 'center' }),
            space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10, }
        }).setInteractive()
        .on('pointerdown', function () {
            var config = {
                onTextChanged: function(textObject, text) {
                    if (!scene.ready) {
                        player.name = text;
                        textObject.text = text;
                        scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, name: player.name });
                    }
                }
            }
            scene.rexUI.edit(scene.playerNameField.getElement('text'), config);
        });

        playerSelector.add(scene.playerNameField, 0, 'left', { top: 10, bottom: 10, left: 10, right: 10 }, true)
    } else {
        var playerField = scene.add.text(0, 0, player.name);
        playerSelector.add(playerField, 0, 'left', { top: 26, bottom: 20, left: 15, right: 10 }, false);
    }


    var frame = getFrameOf(Tilemaps.getTileMap(), player.sprite);
    if (frame != null) {
        var playerSprite = scene.add.sprite(0, 0, Tilemaps.getTileMap().name).setFrame(frame).setTint("0x" + player.color);
        playerSprite.displayWidth = 100;
        playerSprite.scaleY = playerSprite.scaleX; // scale evenly
        playerSelector.add(playerSprite, 0, 'center', { top: 28, bottom: 20, left: 10, right: 10 }, false);

        if (isCurrentPlayer) {
            self.playerSprite = playerSprite;
        }
    }

    var buttonOptions = scene.rexUI.add.sizer({
        orientation: 'x'
    });

    if (isCurrentPlayer) {
        scene.colorPicker = scene.rexUI.add.roundRectangle(0, 0, 40, 40, 5, player.color);
        scene.colorPicker.setStrokeStyle(2, 0xffffff);

        buttonOptions.add(scene.colorPicker);

        scene.colorPicker.setInteractive().on('pointerdown', function(pointer, localX, localY, event) {
            if (!scene.ready) {
                if (scene.colorPickerDialog) {
                    if (scene.rexUI.isShown(scene.colorPickerDialog)) {
                        scene.rexUI.hide(scene.colorPickerDialog);
                    } else {
                        scene.rexUI.show(scene.colorPickerDialog);
                    }
                } else {
                    scene.colorPickerDialog = createColorPickerDialog(scene, player);
                }
            }
        });

        scene.input.on('pointerdown', function (pointer) {
            if (scene.colorPickerDialog && scene.rexUI.isShown(scene.colorPickerDialog) && !scene.rexUI.isInTouching(scene.colorPickerDialog, pointer) && !scene.rexUI.isInTouching(scene.colorPicker, pointer)) {
                scene.rexUI.hide(scene.colorPickerDialog);
            }
        });
    }

    var CheckboxesMode = true;
    var buttons = scene.rexUI.add.fixWidthButtons({
        x: 0, y: 0,
        width: 80,
        buttons: [
            createButton(scene, "Ready? ", isCurrentPlayer)
        ],
        space: {
            left: 10, right: 10, top: 20, bottom: 20,
            line: 10, item: 10
        },
        type: ((CheckboxesMode) ? 'checkboxes' : 'radio'),
        setValueCallback: function (button, value) {
            if (isCurrentPlayer) {
                scene.ready = value;
                button.getElement('icon').setFillStyle((value) ? COLOR_LIGHT : undefined);
                scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, ready: value });

                if (value) {
                    scene.playerNameField.off('pointerdown');

                    if (scene.colorPickerDialog && scene.rexUI.isShown(scene.colorPickerDialog)) {
                        scene.rexUI.hide(scene.colorPickerDialog);
                    }
                } else {
                    scene.playerNameField.on('pointerdown', function () {
                        var config = {
                            onTextChanged: function(textObject, text) {
                                if (!scene.ready) {
                                    player.name = text;
                                    textObject.text = text;
                                    scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, name: player.name });
                                }
                            }
                        }
                        scene.rexUI.edit(scene.playerNameField.getElement('text'), config);
                    });
                }
            }
        }
    });
    buttonOptions.add(buttons, 0, 'right', { top: 10, bottom: 10, left: 20, right: 10 }, false);

    playerSelector.add(buttonOptions);
    playerSelector.layout();
    playerSelector.setDepth(0);

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

var createColorPickerDialog = function (scene, player) {
    // Create components
    var objectPanel = scene.add.rectangle(0, 0, 200, 200).setStrokeStyle(2, 0xffffff);
    var controller = createController(scene, player.color);
    var mainPanel = scene.rexUI.add.sizer({
        orientation: 'x',
    })
    .add(controller, 0, 'top', 0, false)
    .add(objectPanel, 0, 'center', 0, false);

    // Connect events
    var updateFillColor = function () {
        var red = Math.round(controller.getByName('R').getValue(0, 255));
        var green = Math.round(controller.getByName('G').getValue(0, 255));
        var blue = Math.round(controller.getByName('B').getValue(0, 255));
        var newColor = Phaser.Display.Color.GetColor(red, green, blue);
        if (newColor) {
            scene.colorPicker.setFillStyle(newColor);
            objectPanel.setFillStyle(newColor);
            self.playerSprite.setTint(newColor);

            var hexColor = Phaser.Display.Color.ComponentToHex(newColor);
            scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, color: hexColor });
        } else {
            objectPanel.setFillStyle(Phaser.Display.Color.GetColor(0, 0, 0));
        }
    }
    controller.on('valuechange', function () {
        updateFillColor();
    });
    updateFillColor();

    mainPanel.setPosition(400, 300);
    mainPanel.layout();
    mainPanel.setDepth(1000);
    return mainPanel;
};

var createController = function (scene, color) {
    var convertedColor = hexToRgb(color);
    // Create components
    var redSlider = createSlider(scene, 'R', 0xd50000, 0x9b0000, 0xff5131, convertedColor.r).setName('R');
    var greenSlider = createSlider(scene, 'G', 0x00c853, 0x009624, 0x5efc82, convertedColor.g).setName('G');
    var blueSlider = createSlider(scene, 'B', 0x304ffe, 0x0026ca, 0x7a7cff, convertedColor.b).setName('B');
    var controlPanel = scene.rexUI.add.sizer({
        orientation: 'y',
    })
    .add(redSlider, 0, 'center', 0, true)
    .add(greenSlider, 0, 'center', 0, true)
    .add(blueSlider, 0, 'center', 0, true);

    // Connect events
    redSlider.on('valuechange', function () {
        this.emit('valuechange');
    }, controlPanel);
    greenSlider.on('valuechange', function () {
        this.emit('valuechange');
    }, controlPanel);
    blueSlider.on('valuechange', function () {
        this.emit('valuechange');
    }, controlPanel);
    return controlPanel;
};

var createSlider = function (scene, colorText, colorPrimary, colorDark, colorLight, value) {
    return scene.rexUI.add.numberBar({
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, colorDark),

        icon: scene.add.text(0, 0, colorText, {
            fontSize: 18
        }),

        slider: {
            track: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, colorPrimary),
            indicator: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, colorLight),
            input: 'click',
            width: 100, // Fixed width
        },

        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,

            icon: 10,
            slider: 10,
        },

        value: value
    })
}