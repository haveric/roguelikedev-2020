import Phaser from "phaser";
import { getFrameOf, hexToRgb } from "../../utils";
import Tilemaps from "../tilemaps";
import { COLORS } from "../constants/colors";

export class SceneSetup extends Phaser.Scene {
    constructor() {
        super("SceneSetup");
    }

    init(data) {
        this.room = data.room;
        this.socket = data.socket;
    }

    preload() {

    }

    create() {
        const self = this;
        const title = self.add.text(0, 0, "Setup", {font: "48px Arial", fill: "#fff"}).setOrigin(0.5);
        this.rexUI.add.label({
            anchor: {
                centerX: "center"
            },
            y: 50,
            text: title
        }).layout();

        self.roomText = self.add.text(20, 20, "Room Id: " + self.room.roomId, {font: "24px Arial", fill: "#fff"});

        createPlayerLoaders(self, 2);

        for (let i = 0; i < self.room.players.length; i++) {
            const player = self.room.players[i];
            createPlayerSelectorFromLoader(self, player);
        }

        self.socket.on("roomAddPlayer", function(player) {
            createPlayerSelectorFromLoader(self, player);
        });

        self.socket.on("roomUpdatePlayer", function(data) {
            if (data.player && data.player.playerId !== self.socket.id) {
                const playerId = data.player.playerId;

                for (let i = 0; i < self.playerSelectors.length; i++) {
                    const playerSelector = self.playerSelectors[i];

                    if (playerSelector.playerId === playerId) {
                        playerSelector.children[1].setText(data.player.name);

                        playerSelector.children[2].setTint("0x" + data.player.color);

                        const child = playerSelector.children[3];
                        const numChildren = child.children.length;
                        if (numChildren > 0) {
                            const button = child.children[numChildren-1].buttons[0];
                            const icon = button.getElement("icon");
                            const text = button.getElement("text");

                            if (data.player.ready) {
                                icon.setFillStyle(COLORS.COLOR_LIGHT);
                                text.setText("Ready");
                            } else {
                                icon.setFillStyle(undefined);
                                text.setText("Ready?");
                            }
                        }
                    }
                }
            }

            if (data.allPlayersReady !== null) {
                if (data.initialPlayerId === self.socket.id) {
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

        self.socket.on("startGame", function(room) {
            self.scene.start("SceneGameUI");
            self.scene.start("SceneGame", {room: room, socket: this});
        });

        self.events.on("shutdown", function() {
            self.socket.off("roomAddPlayer");
            self.socket.off("roomUpdatePlayer");
            self.socket.off("startGame");
        });
    }
}

const createPlayerLoaders = function(scene, numPlayers) {
    for (let i = 0; i < numPlayers; i++) {
        createPlayerLoader(scene, i);
    }
};

const createPlayerLoader = function(scene, index) {
    const x = 100 * (index + 1) + (250 * (index - 1));
    const y = 150;
    const width = 250;
    const height = 300;
    let centerX = "center";
    if (x > 0) {
        centerX += "+" + x;
    } else {
        centerX += x;
    }

    const background = scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x4e342e);
    const titleField = scene.add.text(0, 0, "Waiting on Player...");

    const playerLoader = scene.rexUI.add.sizer({
        orientation: "y",
        anchor: {
            centerX: centerX
        },
        y: y,
        width: width,
        height: height
    })
    .setOrigin(0)
    .addBackground(background)
    .add(titleField, 0, "center", { top: 135, bottom: 10, left: 10, right: 10 }, false)
    .layout();

    if (!scene.playerLoaders) {
        scene.playerLoaders = [];
    }

    scene.playerLoaders.push(playerLoader);
};

const createPlayerSelectorFromLoader = function(scene, player) {
    if (!scene.playerSelectors) {
        scene.playerSelectors = [];
    }

    for (let i = 0; i < scene.playerLoaders.length; i++) {
        const playerLoader = scene.playerLoaders[i];

        // If open slot, add player
        if (scene.playerSelectors.length === i) {
            createPlayerSelector(scene, i, player);
            scene.rexUI.hide(playerLoader);
            break;
        }
    }
};

const createPlayerSelector = function(scene, index, player) {
    const x = 100 * (index + 1) + (250 * (index - 1));
    const y = 150;
    const width = 250;
    const height = 300;
    let centerX = "center";
    if (x > 0) {
        centerX += "+" + x;
    } else {
        centerX += x;
    }

    const background = scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, 0x4e342e);
    const playerSelector = scene.rexUI.add.sizer({
        orientation: "y",
        anchor: {
            centerX: centerX
        },
        y: y,
        width: width,
        height: height
    })
    .setOrigin(0)
    .addBackground(background);

    const isCurrentPlayer = player.playerId === scene.socket.id;
    if (isCurrentPlayer) {
        scene.playerNameField = scene.rexUI.add.label({
            orientation: "x",
            background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, 0x7b5e57),
            text: scene.rexUI.add.BBCodeText(0, 0, player.name, { fixedWidth: 180, fixedHeight: 36, valign: "center" }),
            space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10, }
        }).setInteractive()
        .on("pointerdown", function () {
            const config = {
                onTextChanged: function(textObject, text) {
                    if (!scene.ready) {
                        player.name = text;
                        textObject.text = text;
                        scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, name: player.name });
                    }
                }
            };
            scene.rexUI.edit(scene.playerNameField.getElement("text"), config);
        });

        playerSelector.add(scene.playerNameField, 0, "left", { top: 10, bottom: 10, left: 10, right: 10 }, true);
    } else {
        const playerField = scene.add.text(0, 0, player.name);
        playerSelector.add(playerField, 0, "left", { top: 26, bottom: 20, left: 15, right: 10 }, false);
    }


    const frame = getFrameOf(Tilemaps.getTileMap(), player.sprite);
    if (frame !== null) {
        const playerSprite = scene.add.sprite(0, 0, Tilemaps.getTileMap().name).setFrame(frame).setTint("0x" + player.color);
        playerSprite.displayWidth = 100;
        playerSprite.scaleY = playerSprite.scaleX; // scale evenly
        playerSelector.add(playerSprite, 0, "center", { top: 28, bottom: 20, left: 10, right: 10 }, false);

        if (isCurrentPlayer) {
            self.playerSprite = playerSprite;
        }
    }

    const buttonOptions = scene.rexUI.add.sizer({
        orientation: "x"
    });

    if (isCurrentPlayer) {
        scene.colorPicker = scene.rexUI.add.roundRectangle(0, 0, 40, 40, 5, player.color);
        scene.colorPicker.setStrokeStyle(2, 0xffffff);

        buttonOptions.add(scene.colorPicker);

        scene.colorPicker.setInteractive().on("pointerdown", function(/*pointer, localX, localY, event*/) {
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

        scene.input.on("pointerdown", function (pointer) {
            if (scene.colorPickerDialog && scene.rexUI.isShown(scene.colorPickerDialog) && !scene.rexUI.isInTouching(scene.colorPickerDialog, pointer) && !scene.rexUI.isInTouching(scene.colorPicker, pointer)) {
                scene.rexUI.hide(scene.colorPickerDialog);
            }
        });
    }

    const CheckboxesMode = true;
    const buttons = scene.rexUI.add.fixWidthButtons({
        x: 0, y: 0,
        width: 80,
        buttons: [
            createButton(scene, "Ready? ", isCurrentPlayer)
        ],
        space: {
            left: 10, right: 10, top: 20, bottom: 20,
            line: 10, item: 10
        },
        type: ((CheckboxesMode) ? "checkboxes" : "radio"),
        setValueCallback: function (button, value) {
            if (isCurrentPlayer) {
                scene.ready = value;
                button.getElement("icon").setFillStyle((value) ? COLORS.COLOR_LIGHT : undefined);
                scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, ready: value });

                if (value) {
                    scene.playerNameField.off("pointerdown");

                    if (scene.colorPickerDialog && scene.rexUI.isShown(scene.colorPickerDialog)) {
                        scene.rexUI.hide(scene.colorPickerDialog);
                    }
                } else {
                    scene.playerNameField.on("pointerdown", function () {
                        const config = {
                            onTextChanged: function(textObject, text) {
                                if (!scene.ready) {
                                    player.name = text;
                                    textObject.text = text;
                                    scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, name: player.name });
                                }
                            }
                        };
                        scene.rexUI.edit(scene.playerNameField.getElement("text"), config);
                    });
                }
            }
        }
    });
    buttonOptions.add(buttons, 0, "right", { top: 10, bottom: 10, left: 20, right: 10 }, false);

    playerSelector.add(buttonOptions);
    playerSelector.layout();
    playerSelector.setDepth(0);

    playerSelector.playerId = player.playerId;

    scene.playerSelectors.push(playerSelector);
};

const createButton = function (scene, text, isCurrentPlayer) {
    const background = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10);
    if (isCurrentPlayer) {
        background.setStrokeStyle(2, COLORS.COLOR_LIGHT);
    }
    return scene.rexUI.add.label({
        background: background,
        icon: scene.add.circle(0, 0, 10).setStrokeStyle(1, COLORS.COLOR_DARK),
        text: scene.add.text(0, 0, text, {
            fontSize: 18
        }),
        space: {
            left: 10, right: 10, top: 10, bottom: 10,
            icon: 10
        },
        align: "center",
        name: text
    });
};

const createStartGameButton = function(scene, text) {
    const background = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10);
    background.setStrokeStyle(2, COLORS.COLOR_LIGHT);
    const startButton = scene.rexUI.add.label({
        x: 0, y: 0,
        background: background,
        text: scene.add.text(0, 0, text, {
            fontSize: 18
        }),
        space: {
            left: 10, right: 10, top: 10, bottom: 10,
            icon: 10
        },
        align: "center",
        name: text
    });

    const btns = [];
    btns.push(startButton);
    const buttons = scene.rexUI.add.buttons({
        x: 400, y: 525,
        width: 80,
        buttons: btns,
        space: {
            left: 10, right: 10, top: 20, bottom: 20,
            line: 10, item: 10
        }
    }).layout();

    buttons.on("button.click", function(/*button, index, pointer, event*/) {
        scene.socket.emit("startGame", { roomId: scene.room.roomId, playerId: scene.socket.id } );
    });

    return buttons;
};

const createColorPickerDialog = function (scene, player) {
    // Create components
    const objectPanel = scene.add.rectangle(0, 0, 200, 200).setStrokeStyle(2, 0xffffff);
    const controller = createController(scene, player.color);
    const mainPanel = scene.rexUI.add.sizer({
        orientation: "x",
    })
    .add(controller, 0, "top", 0, false)
    .add(objectPanel, 0, "center", 0, false);

    // Connect events
    const updateFillColor = function () {
        const red = Math.round(controller.getByName("R").getValue(0, 255));
        const green = Math.round(controller.getByName("G").getValue(0, 255));
        const blue = Math.round(controller.getByName("B").getValue(0, 255));
        const newColor = Phaser.Display.Color.GetColor(red, green, blue);
        if (newColor) {
            scene.colorPicker.setFillStyle(newColor);
            objectPanel.setFillStyle(newColor);
            self.playerSprite.setTint(newColor);

            let hexColor = Phaser.Display.Color.ComponentToHex(newColor);

            // ComponentToHex trims starting zeros for some reason, add them back
            while (hexColor.length < 6) {
                hexColor = "0" + hexColor;
            }

            scene.socket.emit("roomUpdatePlayer", { roomId: scene.room.roomId, playerId: scene.socket.id, color: hexColor });
        } else {
            objectPanel.setFillStyle(Phaser.Display.Color.GetColor(0, 0, 0));
        }
    };
    controller.on("valuechange", function () {
        updateFillColor();
    });
    updateFillColor();

    mainPanel.setPosition(400, 300);
    mainPanel.setAnchor({centerX: "center"});
    mainPanel.layout();
    mainPanel.setDepth(1000);
    return mainPanel;
};

const createController = function (scene, color) {
    const convertedColor = hexToRgb(color);
    // Create components
    const redSlider = createSlider(scene, "R", 0xd50000, 0x9b0000, 0xff5131, convertedColor.r).setName("R");
    const greenSlider = createSlider(scene, "G", 0x00c853, 0x009624, 0x5efc82, convertedColor.g).setName("G");
    const blueSlider = createSlider(scene, "B", 0x304ffe, 0x0026ca, 0x7a7cff, convertedColor.b).setName("B");
    const controlPanel = scene.rexUI.add.sizer({
        orientation: "y",
    })
    .add(redSlider, 0, "center", 0, true)
    .add(greenSlider, 0, "center", 0, true)
    .add(blueSlider, 0, "center", 0, true);

    // Connect events
    redSlider.on("valuechange", function () {
        this.emit("valuechange");
    }, controlPanel);
    greenSlider.on("valuechange", function () {
        this.emit("valuechange");
    }, controlPanel);
    blueSlider.on("valuechange", function () {
        this.emit("valuechange");
    }, controlPanel);
    return controlPanel;
};

const createSlider = function (scene, colorText, colorPrimary, colorDark, colorLight, value) {
    return scene.rexUI.add.numberBar({
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, colorDark),

        icon: scene.add.text(0, 0, colorText, {
            fontSize: 18
        }),

        slider: {
            track: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, colorPrimary),
            indicator: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, colorLight),
            input: "click",
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
    });
};