import Srand from 'seeded-rand';
import { create2dArray } from '../../utils';
import Engine from '../engine';
import { Fov } from '../fov';
import Player from '../player';
import Sprite from '../sprite';
import { GeneratorOptions, Ship } from '../ship-gen/shipGenerator';
import GameMap from '../gameMap';
import EntityFactories from '../entityFactories';
import { WaitAction, MeleeAction, MovementAction, OpenAction, WarpAction } from '../actions';
import Fighter from '../components/fighter';

export class SceneGame extends Phaser.Scene {
    constructor() {
        super('SceneGame');
    }

    init(data) {
        this.room = data.room;
        this.socket = data.socket;

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

        Object.keys(self.room.players).forEach(function(index) {
            var player = self.room.players[index];

            var newPlayer = new EntityFactories.player(player.playerId, player.x, player.y, player.name, player.color, player.energy, player.energyMax);
            if (player.playerId == self.socket.id) {
                self.player = newPlayer;
                self.entities.push(self.player);
                self.players.push(self.player);
            } else {
                var otherPlayer = newPlayer;
                self.entities.push(otherPlayer);

                self.otherPlayers.push(otherPlayer);
                self.players.push(otherPlayer);
            }
        });

        // var isHost = self.room.players[0].playerId == self.socket.id;
        this.engine = new Engine(this, self.player, self.players);

        var width = 70;
        var height = 40;
        var genOptions = new GeneratorOptions(1, 30, 6, 10, width, height, 4, 3);
        this.shipGenerator = new Ship(this.engine, self.entities, genOptions);
        this.engine.gameMap = this.shipGenerator.generateDungeon();
        this.shipGenerator.setPlayerCoordinates(self.players);
        this.engine.createSprites(self);
        this.engine.updateFov();

        if (self.player) {
            self.events.emit('ui-enable', self.engine);
            self.events.emit('ui-updateHp', { hp: self.player.fighter.getHp(), hpMax: self.player.fighter.hpMax });
            self.events.emit('ui-updateEnergy', {energy: self.player.energy, energyMax: self.player.energyMax });
            self.events.emit('ui-updateCoordinates', { x: self.player.x, y: self.player.y })
        }

        self.engine.eventHandler.on('action', function(action) {
            if (self.player) {
                var actionResult = action.perform(false);
                if (actionResult.success) {
                    self.socket.emit('s-performAction', {roomId: self.room.roomId, playerId: self.socket.id, actionData: actionResult.action.toString()});
                }
            }
        });

        self.engine.eventHandler.on('zoom', function(zoomLevel) {
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

        self.engine.eventHandler.on('debug', function() {
            self.engine.clearFov();
            self.player.energy = 5000;
            self.player.energyMax = 5000;
            self.engine.eventHandler.debugEnabled = true;
            self.events.emit('ui-updateEnergy', {energy: self.player.energy, energyMax: self.player.energyMax });
            self.socket.emit('updateEnergy', { roomId: self.room.roomId, playerId: self.socket.id, energy: self.player.energy, energyMax: self.player.energyMax });
        });

        self.engine.eventHandler.on('addEnergy', function () {
            self.player.energy = 5000;
            self.player.energyMax = 5000;
            self.events.emit('ui-updateEnergy', {energy: self.player.energy, energyMax: self.player.energyMax });
            self.socket.emit('updateEnergy', { roomId: self.room.roomId, playerId: self.socket.id, energy: self.player.energy, energyMax: self.player.energyMax});
        });

        self.engine.eventHandler.on('debugRoom', function () {
            self.socket.emit('s-createDebugRoom', { roomId: self.room.roomId, playerId: self.socket.id });
        });

        self.socket.on('c-createDebugRoom', function (data) {
            var playerId = data.playerId;
            var debugRoomCenter = self.shipGenerator.createDebugRoom().center();
            self.engine.createSprites(self, 0, 0, 8, 8);
            self.updateCameraView();

            if (self.player.playerId === playerId) {
                self.engine.eventHandler.warp(debugRoomCenter.x, debugRoomCenter.y);
            }
        });

        self.socket.on('c-performAction', function (data) {
            var playerId = data.playerId;
            var actionData = data.actionData;
            var args = actionData.args;

            for (var i = 0; i < self.players.length; i++) {
                var player = self.players[i];
                if (playerId === player.playerId) {
                    switch (actionData.action) {
                        case "WaitAction":
                            new WaitAction(player).perform(true);
                            break;
                        case "MeleeAction":
                            new MeleeAction(player, args.dx, args.dy).perform(true);
                            break;
                        case "MovementAction":
                            new MovementAction(player, args.dx, args.dy).perform(true);
                            break;
                        case "OpenAction":
                            new OpenAction(player, args.dx, args.dy).perform(true);
                            break;
                        case "WarpAction":
                            new WarpAction(player, args.x, args.y).perform(true);
                            break;
                        default:
                            console.err("Unrecognized action: " + actionData.action);
                            break;
                    }
                }
            }

            self.events.emit('ui-updateHp', { hp: self.player.fighter.getHp(), hpMax: self.player.fighter.hpMax });
            self.events.emit('ui-updateCoordinates', { x: self.player.x, y: self.player.y })

            self.engine.handleEnemyTurns();
            self.engine.updateFov();
        });

        self.socket.on('updatePlayerData', function (players) {
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                if (player.playerId == self.socket.id) {
                    self.player.energy = player.energy;
                    self.events.emit('ui-updateEnergy', {energy: self.player.energy, energyMax: self.player.energyMax });
                    break;
                }
            }
        });

        self.updateCameraView();
        self.engine.messageLog.text("Welcome to Tethered, ", "#000066").text(self.player.name, "#" + self.player.sprite.color).text("!", "#000066").build();
    }

    updateCameraView() {
        var objectToFollow;
        if (this.player) {
            objectToFollow = this.player.sprite.spriteObject
        } else {
            objectToFollow = this.otherPlayers[0].sprite.spriteObject;
        }

        this.cameras.main.setBounds(0, 0, this.displayWidth, this.displayHeight);
        this.cameras.main.startFollow(objectToFollow);
        this.cameras.main.followOffset.set(-100, -50);
    }
}