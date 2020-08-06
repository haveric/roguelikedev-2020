import Phaser from "phaser";
import Srand from "seeded-rand";
import Engine from "../engine";
import { GeneratorOptions, Ship } from "../ship-gen/shipGenerator";
import EntityFactories from "../entityFactories";
import { InventoryEventHandler } from "../eventHandler";
import { WaitAction, MeleeAction, MovementAction, OpenAction, CloseAction, WarpAction, PickupAction, InteractWithTileAction, ItemAction, DropItemAction, DebugAction, EquipAction } from "../actions";

export class SceneGame extends Phaser.Scene {
    constructor() {
        super("SceneGame");
    }

    init(data) {
        this.room = data.room;
        this.socket = data.socket;

        Srand.seed(this.room.seed);
        console.log("Seed: " + this.room.seed);
    }

    create() {
        const self = this;

        self.socket.on("c-createDebugRoom", function () {
            const debugMap = self.engine.getGameMap("DEBUG");
            self.engine.setGameMap(debugMap);
            self.engine.createSprites();

            for (let i = 0; i < self.players.length; i++) {
                const player = self.players[i];
                player.place(debugMap, 10 + i, 10);
            }

            self.engine.updateFov();
            self.updateCameraView();
        });

        self.socket.on("c-regenMap", function (data) {
            const newSeed = data.seed;
            self.room.seed = newSeed;
            Srand.seed(newSeed);
            console.log("New Seed: " + newSeed);

            self.generateNewShip();
        });

        self.socket.on("c-performAction", function (data) {
            const playerId = data.playerId;
            const actionData = data.actionData;
            const args = actionData.args;

            for (let i = 0; i < self.players.length; i++) {
                const player = self.players[i];
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
                        case "CloseAction":
                            new CloseAction(player, args.dx, args.dy).perform(true);
                            break;
                        case "WarpAction":
                            new WarpAction(player, args.x, args.y).perform(true);
                            break;
                        case "PickupAction":
                            new PickupAction(player).perform(true);
                            break;
                        case "InteractWithTileAction":
                            new InteractWithTileAction(player).perform(true);
                            break;
                        case "ItemAction":
                            new ItemAction(player, args.inventorySlot, args.targetXY).perform(true);
                            break;
                        case "EquipAction":
                            new EquipAction(player, args.inventorySlot).perform(true);
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

                if (player === self.player) {
                    self.engine.eventHandler.updateSidePanelDescriptionsForTile(self.player.x, self.player.y, true);
                }

                if (self.engine.eventHandler instanceof InventoryEventHandler) {
                    self.engine.eventHandler.render();
                }
            }

            self.events.emit("ui-updateHp", { hp: self.player.fighter.getHp(), hpMax: self.player.fighter.getMaxHp() });

            self.engine.handleEnemyTurns();
            self.engine.updateFov();
        });

        self.socket.on("updatePlayerData", function (players) {
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if (player.playerId === self.socket.id) {
                    self.player.energy = player.energy;
                    self.events.emit("ui-updateEnergy", {energy: self.player.energy, energyMax: self.player.energyMax });
                    break;
                }
            }
        });

        self.socket.on("c-showEndGameDialog", function() {
            self.engine.ui.showEndGameDialog();
        });
        //TODO: Figure out how switch to lobby, kill SceneGameUI and reset SceneSetup
        /*
        self.socket.on("c-endGameReturnToLobby", function() {
            self.engine.ui.endGameDialog.hideDialog();
            self.scene.start("SceneLobby");
        });
        */
        self.socket.on("c-endGameRestart", function() {
            self.engine.ui.endGameDialog.hideDialog();
            self.startNewGame();
        });

        self.socket.on("c-endGameVoteRestart", function(data) {
            const playerId = data.playerId;

            if (self.player.playerId !== playerId) {
                self.engine.ui.updateEndGameDialogOtherPlayerWaiting();
            }
        });

        self.events.on("shutdown", function() {
            if (this.engine) {
                this.engine.teardown();
            }
            self.socket.off("c-createDebugRoom");
            self.socket.off("c-regenMap");
            self.socket.off("c-performAction");
            self.socket.off("updatePlayerData");
            self.socket.off("c-showEndGameDialog");
            self.socket.off("c-endGameReturnToLobby");
            self.socket.off("c-endGameRestart");
            self.socket.off("c-endGameVoteRestart");
        });

        self.startNewGame();
        self.engine.ui.showControls();
    }

    startNewGame() {
        if (this.engine) {
            this.engine.teardown();
        }
        this.createNewPlayers();
        this.engine = new Engine(this, this.player, this.players);
        this.initPlayerUI();
        this.generatePlayerShip();
        this.createDebugMap();

        this.engine.ui.messageLog.text("Welcome to Tethered, ", "#000066").text(this.player.name, "#" + this.player.sprite.color).text("!", "#000066").build();
        // Set after maps are created to avoid movement on non-existent maps
        this.engine.setMainEventHandler();
    }

    createNewPlayers() {
        const self = this;
        this.otherPlayers = [];
        this.players = [];
        Object.keys(self.room.players).forEach(function(index) {
            const player = self.room.players[index];

            const newPlayer = new EntityFactories.player(player.playerId, player.x, player.y, player.name, player.color, player.energy, player.energyMax);
            if (player.playerId === self.socket.id) {
                self.player = newPlayer;
                self.players.push(self.player);
            } else {
                const otherPlayer = newPlayer;

                self.otherPlayers.push(otherPlayer);
                self.players.push(otherPlayer);
            }
        });
    }

    initPlayerUI() {
        const self = this;
        if (self.player) {
            self.events.emit("ui-enable", self.engine);
            self.events.emit("ui-updateHp", { hp: self.player.fighter.getHp(), hpMax: self.player.fighter.getMaxHp() });
            self.events.emit("ui-updateEnergy", {energy: self.player.energy, energyMax: self.player.energyMax });
        }
    }

    updateCameraView(objectToFollow) {
        if (!objectToFollow) {
            if (this.player) {
                objectToFollow = this.player.sprite.spriteObject;
            } else {
                objectToFollow = this.otherPlayers[0].sprite.spriteObject;
            }
        }

        this.cameras.main.setBounds(0, 0, this.displayWidth, this.displayHeight);
        this.cameras.main.startFollow(objectToFollow, true);
        this.cameras.main.followOffset.set(-100, -50);
    }

    createDebugMap() {
        this.shipGenerator.createDebugMap();
    }

    generatePlayerShip() {
        const width = 70;
        const height = 40;
        const genOptions = new GeneratorOptions(1, 30, 6, 10, width, height, 4, 3, 3);

        this.shipGenerator = new Ship(this.engine, genOptions);
        this.engine.setGameMap(this.shipGenerator.generatePlayerShip());
        this.shipGenerator.setPlayerCoordinates(this.players);
        this.engine.createSprites();
        this.engine.updateFov();

        this.updateCameraView();
    }

    generateNewShip() {
        const width = 70;
        const height = 40;
        const genOptions = new GeneratorOptions(1, 30, 6, 10, width, height, 4, 3, 3);

        this.shipGenerator = new Ship(this.engine, genOptions);
        this.engine.setGameMap(this.shipGenerator.generateDungeon());
        this.shipGenerator.setPlayerCoordinates(this.players);
        this.engine.createSprites();
        this.engine.updateFov();

        this.updateCameraView();
    }
}