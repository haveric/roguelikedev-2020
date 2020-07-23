import Srand from 'seeded-rand';
import { create2dArray } from '../../utils';
import Engine from '../engine';
import { Fov } from '../fov';
import Player from '../player';
import Sprite from '../sprite';
import { GeneratorOptions, Ship } from '../ship-gen/shipGenerator';
import GameMap from '../gameMap';
import EntityFactories from '../entityFactories';
import { InventoryEventHandler } from '../eventHandler';
import { WaitAction, MeleeAction, MovementAction, OpenAction, WarpAction, PickupAction, ItemAction, DropItemAction, DebugAction } from '../actions';
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

        Srand.seed(this.room.seed);
        console.log("Seed: " + this.room.seed);
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
        var genOptions = new GeneratorOptions(1, 30, 6, 10, width, height, 4, 3, 3);
        this.shipGenerator = new Ship(this.engine, self.entities, genOptions);
        this.engine.gameMap = this.shipGenerator.generateDungeon();
        this.shipGenerator.setPlayerCoordinates(self.players);
        this.engine.createSprites(self);
        this.engine.updateFov();

        if (self.player) {
            self.events.emit('ui-enable', self.engine);
            self.events.emit('ui-updateHp', { hp: self.player.fighter.getHp(), hpMax: self.player.fighter.hpMax });
            self.events.emit('ui-updateEnergy', {energy: self.player.energy, energyMax: self.player.energyMax });
        }

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
                        case "PickupAction":
                            new PickupAction(player).perform(true);
                            break;
                        case "ItemAction":
                            new ItemAction(player, args.inventorySlot, args.targetXY).perform(true);
                            break;
                        case "DropItemAction":
                            new DropItemAction(player, args.inventorySlot).perform(true);
                            break;
                        case "DebugAction":
                            new DebugAction(player).perform(true);
                            break;
                        default:
                            console.error("Unrecognized action: " + actionData.action);
                            break;
                    }
                }

                if (self.engine.eventHandler instanceof InventoryEventHandler) {
                    self.engine.eventHandler.render();
                }
            }

            self.events.emit('ui-updateHp', { hp: self.player.fighter.getHp(), hpMax: self.player.fighter.hpMax });

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
        self.engine.ui.messageLog.text("Welcome to Tethered, ", "#000066").text(self.player.name, "#" + self.player.sprite.color).text("!", "#000066").build();
    }

    updateCameraView(objectToFollow) {
        if (!objectToFollow) {
            if (this.player) {
                objectToFollow = this.player.sprite.spriteObject
            } else {
                objectToFollow = this.otherPlayers[0].sprite.spriteObject;
            }
        }

        this.cameras.main.setBounds(0, 0, this.displayWidth, this.displayHeight);
        this.cameras.main.startFollow(objectToFollow);
        this.cameras.main.followOffset.set(-100, -50);
    }
}