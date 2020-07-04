import Srand from 'seeded-rand';
import Engine from '../engine.js';
import { Fov } from '../fov.js';
import Player from '../player.js';
import Sprite from '../sprite.js';
import EventHandler from '../eventHandler.js';
import { create2dArray } from '../../utils.js';
import { GeneratorOptions, Ship } from '../ship-gen/shipGenerator.js';
import GameMap from '../gameMap.js';

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
                "shroud": 219,
                "player": 64,
                "wall": 35,
                "floor": 219,
                "spacePirate": 80,
                "attackDog": 100,
                "automatedTurret": 84,
                "torch": 105,
                "door": 68
            }
        }
        this.mapOffsetWidth = 400;
        this.mapOffsetHeight = 300;

        this.keysDown = [];
        this.player;
        this.otherPlayers = [];
        this.players = [];
        this.entities = [];
        this.zoomLevel = 1;

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

        var width = 70;
        var height = 40;
        var genOptions = new GeneratorOptions(1, 30, 6, 10, width, height, 4, 3);
        var initialGameMap = new GameMap(width, height, self.entities);
        var shipGenerator = new Ship(initialGameMap, genOptions);
        this.gameMap = shipGenerator.generateDungeon();
        shipGenerator.setPlayerCoordinates(self.players);
        this.engine = new Engine(this.eventHandler, this.gameMap, this.tilemap, self.player, self.otherPlayers);
        this.engine.createSprites(self);
        this.engine.updateFov();

        if (self.player) {
            self.events.emit('ui-enable');
            self.events.emit('ui-updateEnergy', self.player.energy);
        }

        self.eventHandler.on('action', function(action) {
            if (self.player && self.player.energy > 0) {
                if (action.perform(self, self.player)) {
                    self.player.energy -= 1;

                    self.events.emit('ui-updateEnergy', self.player.energy);
                    self.socket.emit('playerMovement', { roomId: self.room.roomId, playerId: self.socket.id, x: self.player.x, y: self.player.y });

                    self.engine.updateFov();
                    self.engine.handleEnemyTurns();
                }
            }
        });

        self.eventHandler.on('zoom', function(zoomLevel) {
            if (zoomLevel == 1) { // Zoom In
                if (self.zoomLevel < 2) {
                    self.zoomLevel ++;
                }
            } else if (zoomLevel == -1) { // Zoom Out
                if (self.zoomLevel > -1) {
                    self.zoomLevel --;
                }
            }

            var zoom;
            switch(self.zoomLevel) {
                case 1: zoom = 1; break;
                case 2: zoom = 2; break;
                case 0: zoom = .5; break;
                case -1: zoom = .25; break;
                default: zoom = 1; break;
            }
            self.cameras.main.setZoom(zoom);
        });

        self.eventHandler.on('debug', function() {
            self.engine.clearFov();
            self.player.energy = 5000;
            self.eventHandler.debugEnabled = true;
            self.events.emit('ui-updateEnergy', self.player.energy);
            self.socket.emit('playerMovement', { roomId: self.room.roomId, playerId: self.socket.id, x: self.player.x, y: self.player.y, energy: self.player.energy});
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

            self.engine.updateFov();
        });

        self.socket.on('updatePlayerData', function (players) {
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                if (player.playerId == self.socket.id) {
                    self.player.energy = player.energy;
                    self.events.emit('ui-updateEnergy', self.player.energy);
                    break;
                }
            }
        });
    }
}