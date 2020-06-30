import Engine from '../engine.js';
import GameMap from '../gameMap.js';
import Player from '../player.js';
import Sprite from '../sprite.js';
import EventHandler from '../eventHandler.js';
import { getFrameOf, create2dArray } from '../../utils.js';

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
                "#": 35,
                "█": 219
            }
        }
        this.mapOffsetWidth = 400;
        this.mapOffsetHeight = 300;

        this.keysDown = [];
        this.player;
        this.otherPlayers = [];
        this.entities = [];
    }

    preload() {

    }

    create() {
        var self = this;

        this.eventHandler = new EventHandler(this.input.keyboard);
        this.gameMap = new GameMap(20, 20);
        this.gameMap.createTestMap();

        Object.keys(self.room.players).forEach(function(index) {
            var player = self.room.players[index];
            if (player.playerId == self.socket.id) {
                var playerSprite = new Sprite(player.sprite, player.icon, player.color);
                self.player = new Player(player.playerId, player.x, player.y, player.name, playerSprite, player.energy, player.energyMax);
                self.entities.push(self.player);
            } else {
                var playerSprite = new Sprite(player.sprite, player.icon, player.color);
                var otherPlayer = new Player(player.playerId, player.x, player.y, player.name, playerSprite, player.energy, player.energyMax);
                self.entities.push(otherPlayer);

                self.otherPlayers.push(otherPlayer);
            }
        });

        this.engine = new Engine(this.entities, this.eventHandler, this.gameMap, this.tilemap, self.player, self.otherPlayers);
        this.engine.createSprites(self);

        if (self.player) {
            var energyStyle = {font: "30px Arial", fill: "#ffff00" };
            self.energy = self.add.text(30, 30, "Energy: " + self.player.energy, energyStyle);
            self.energy.setScrollFactor(0,0);
        }

        self.eventHandler.on('action', function(action) {
            if (self.player && self.player.energy > 0) {
                action.perform(self, self.player);

                self.player.energy -= 1;

                self.energy.setText("Energy: " + self.player.energy);
                self.socket.emit('playerMovement', { roomId: self.room.roomId, playerId: self.socket.id, x: self.player.x, y: self.player.y });
            }
        });

        var objectToFollow;
        if (self.player) {
            objectToFollow = self.player.sprite.spriteObjects[0]
        } else {
            objectToFollow = self.otherPlayers[0].sprite.spriteObjects[0];
        }

        self.cameras.main.setBounds(0, 0, self.displayWidth, self.displayHeight);
        self.cameras.main.startFollow(objectToFollow);

        self.socket.on('playerMoved', function (playerInfo) {
            for (var i = 0; i < self.otherPlayers.length; i++) {
                var otherPlayer = self.otherPlayers[i];
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.moveTo(self.engine, playerInfo.x, playerInfo.y);
                }
            }
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

    update() {

    }
}

var movePlayer = function(self, player, x, y) {
    if (player && self.player.energy > 0) {
        var newXTile = self.room.map.tiles[player.tileX + x];
        if (newXTile) {
            var newXYTile = newXTile[player.tileY + y];
            if (newXYTile && !newXYTile.blocked) {


            }
        }
    }
}