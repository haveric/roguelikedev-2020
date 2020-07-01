import Srand from 'seeded-rand';
import Engine from '../engine.js';
import { createTestMap, generateDungeonSimple, generateDungeon } from '../procgen.js';
import Player from '../player.js';
import Sprite from '../sprite.js';
import EventHandler from '../eventHandler.js';
import { create2dArray } from '../../utils.js';

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
                "player": 64,
                "wall": 35,
                "floor": 219,
                "spacePirate": 80,
                "attackDog": 100,
                "automatedTurret": 84
            }
        }
        this.mapOffsetWidth = 400;
        this.mapOffsetHeight = 300;

        this.keysDown = [];
        this.player;
        this.otherPlayers = [];
        this.players = [];
        this.entities = [];

        Srand.seed(this.room.seed);
    }

    create() {
        var self = this;

        this.eventHandler = new EventHandler(this.input.keyboard);

        Object.keys(self.room.players).forEach(function(index) {
            var player = self.room.players[index];
            if (player.playerId == self.socket.id) {
                var playerSprite = new Sprite(player.sprite, player.color);
                self.player = new Player(player.playerId, player.x, player.y, player.name, playerSprite, true, player.energy, player.energyMax);
                self.entities.push(self.player);
                self.players.push(self.player);
            } else {
                var playerSprite = new Sprite(player.sprite, player.color);
                var otherPlayer = new Player(player.playerId, player.x, player.y, player.name, playerSprite, true, player.energy, player.energyMax);
                self.entities.push(otherPlayer);

                self.otherPlayers.push(otherPlayer);
                self.players.push(otherPlayer);
            }
        });

        // var isHost = self.room.players[0].playerId == self.socket.id;

        //this.gameMap = createTestMap(20, 20, self.entities);
        //this.gameMap = generateDungeonSimple(80, 50, self.entities);
        this.gameMap = generateDungeon(30, 6, 10, 80, 50, 3, self.entities, self.players);
        this.engine = new Engine(this.eventHandler, this.gameMap, this.tilemap, self.player, self.otherPlayers);
        this.engine.createSprites(self);

        if (self.player) {
            var energyStyle = {font: "30px Arial", fill: "#ffff00" };
            self.energy = self.add.text(30, 30, "Energy: " + self.player.energy, energyStyle);
            self.energy.setScrollFactor(0,0);
        }

        self.eventHandler.on('action', function(action) {
            if (self.player && self.player.energy > 0) {
                if (action.perform(self, self.player)) {
                    self.player.energy -= 1;

                    self.energy.setText("Energy: " + self.player.energy);
                    self.socket.emit('playerMovement', { roomId: self.room.roomId, playerId: self.socket.id, x: self.player.x, y: self.player.y });

                    self.engine.handleEnemyTurns();
                }
            }
        });

        var objectToFollow;
        if (self.player) {
            objectToFollow = self.player.sprite.spriteObject
        } else {
            objectToFollow = self.otherPlayers[0].sprite.spriteObject;
        }

        self.cameras.main.setBounds(0, 0, self.displayWidth, self.displayHeight);
        self.cameras.main.startFollow(objectToFollow);

        self.socket.on('otherPlayerMoved', function (playerInfo) {
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
}