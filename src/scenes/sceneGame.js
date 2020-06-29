export class SceneGame extends Phaser.Scene {
    constructor() {
        super('SceneGame');
    }

    init(data) {
        this.room = data.room;
        this.socket = data.socket;
        this.tilemap = {
            name: "tilemap",
            frameWidth: 24,
            frameHeight: 24,
            tiles: {
                "@": 64,
                ".": 35,
                "█": 219
            }
        }
        this.mapOffsetWidth = 400;
        this.mapOffsetHeight = 300;

        this.keysDown = [];
        this.player;
        this.otherPlayers = this.add.group();
    }

    preload() {

    }

    create() {
        var self = this;

        for (var i = 0; i < self.room.map.rows; i++) {
            for (var j = 0; j < self.room.map.cols; j++) {
                var tile = self.room.map.tiles[i][j];

                var frameData = getFrameOf(self, tile.sprite, tile.icon, tile.bgIcon);
                if (frameData.bgFrame != null) {
                    var spriteBG = self.add.sprite(self.mapOffsetWidth + (i * self.tilemap.frameWidth), self.mapOffsetHeight + (j * self.tilemap.frameHeight), self.tilemap.name).setOrigin(0, 0);
                    spriteBG.setFrame(frameData.bgFrame);
                    spriteBG.setTint("0x" + tile.bgColor);
                    tile.spriteBG = spriteBG;
                }

                if (frameData.frame != null) {
                    var sprite = self.add.sprite(self.mapOffsetWidth + (i * self.tilemap.frameWidth), self.mapOffsetHeight + (j * self.tilemap.frameHeight), self.tilemap.name).setOrigin(0, 0);
                    sprite.setFrame(frameData.frame);
                    sprite.setTint("0x" + tile.color);

                    tile.sprite = sprite;
                }
            }
        }

        Object.keys(self.room.players).forEach(function(index) {
            var player = self.room.players[index];
            if (player.playerId == self.socket.id) {

                var sprite = self.add.sprite(self.mapOffsetWidth + (player.tileX * self.tilemap.frameWidth), self.mapOffsetHeight + (player.tileY * self.tilemap.frameHeight), self.tilemap.name).setOrigin(0, 0);
                var frameData = getFrameOf(self, player.sprite, player.icon);
                if (frameData.frame != null) {
                    sprite.setFrame(frameData.frame);
                    sprite.setTint("0x" + player.color);
                }
                self.player = player;

                self.playerSprite = sprite;
                self.playerSprite.tileX = player.tileX;
                self.playerSprite.tileY = player.tileY;

                var energyStyle = {font: "30px Arial", fill: "#ffff00" };
                self.energy = self.add.text(30, 30, "Energy: " + player.energy, energyStyle);
                self.energy.setScrollFactor(0,0);

                self.cameras.main.setBounds(0, 0, self.displayWidth, self.displayHeight);
                self.cameras.main.startFollow(self.playerSprite);
            } else {
                var sprite = self.add.sprite(self.mapOffsetWidth + (player.tileX * self.tilemap.frameWidth), self.mapOffsetHeight + (player.tileY * self.tilemap.frameHeight), self.tilemap.name).setOrigin(0, 0);
                var frameData = getFrameOf(self, player.sprite, player.icon);
                if (frameData.frame != null) {
                    sprite.setFrame(frameData.frame);
                    sprite.setTint("0x" + player.color);
                }
                sprite.playerId = player.playerId;

                self.otherPlayers.add(sprite);
            }
        });

        this.input.keyboard.on('keydown', function(event) {
            if (!self.keysDown[event.code]) {
                switch (event.code) {
                    // Left
                    case "KeyA":
                    case "ArrowLeft":
                    case "Numpad4":
                        movePlayer(self, self.playerSprite, -1, 0);
                        break;
                    // Right
                    case "KeyD":
                    case "ArrowRight":
                    case "Numpad6":
                        movePlayer(self, self.playerSprite, 1, 0);
                        break;
                    // Up
                    case "KeyW":
                    case "ArrowUp":
                    case "Numpad8":
                        movePlayer(self, self.playerSprite, 0, -1);
                        break;
                    // Down
                    case "KeyS":
                    case "ArrowDown":
                    case "Numpad2":
                        movePlayer(self, self.playerSprite, 0, 1);
                        break;
                    // Northwest
                    case "Numpad7":
                        movePlayer(self, self.playerSprite, -1, -1);
                        break;
                    // Northeast
                    case "Numpad9":
                        movePlayer(self, self.playerSprite, 1, -1);
                        break;
                    // Southwest
                    case "Numpad1":
                        movePlayer(self, self.playerSprite, -1, 1);
                        break;
                    // Southeast
                    case "Numpad3":
                        movePlayer(self, self.playerSprite, 1, 1);
                        break;
                    // Wait
                    case "Numpad5":
                        movePlayer(self, self.playerSprite, 0, 0);
                        break;
                    default:
                        break;
                }
            }

            self.keysDown[event.code] = 1;
        });

        this.input.keyboard.on('keyup', function(event) {
            self.keysDown[event.code] = 0;
        });

        self.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.x = playerInfo.x;
                    otherPlayer.y = playerInfo.y;
                }
            });
        });

        self.socket.on('updatePlayerData', function (players) {
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                if (player.playerId == self.socket.id) {
                    self.player.energy = player.energy;
                    self.energy.setText("Energy: " + self.player.energy);
                    break;
                }
            }
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

var movePlayer = function(self, player, x, y) {
    if (player && self.player.energy > 0) {
        var newXTile = self.room.map.tiles[player.tileX + x];
        if (newXTile) {
            var newXYTile = newXTile[player.tileY + y];
            if (newXYTile && !newXYTile.blocked) {
                player.tileX += x;
                player.tileY += y;

                player.x += (x * self.tilemap.frameWidth);
                player.y += (y * self.tilemap.frameHeight);

                self.player.energy -= 1;
                self.energy.setText("Energy: " + self.player.energy);

                self.socket.emit('playerMovement', { roomId: self.room.roomId, playerId: self.socket.id, x: player.x, y: player.y, tileX: player.tileX, tileY: player.tileY });
            }
        }
    }
}