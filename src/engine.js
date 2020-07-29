import { MainGameEventHandler } from "./eventHandler";
import { FovAdamMillazo } from "./fov";
import Tilemaps from "./tilemaps";
import UI from "./ui/ui";

export default class Engine {
    constructor(scene, player, players) {
        var self = this;

        self.scene = scene;
        self.zoomLevel = 1;
        self.debugEnabled = false;

        self.eventHandler = new MainGameEventHandler(scene.input, this);
        self.ui = new UI(scene.scene.get("SceneGameUI"));
        self.gameMap = null;
        self.gameMaps = {};
        self.player = player;
        self.players = players;

        self.enemyTurn = 0;
    }

    createSprites(startX, startY, endX, endY) {
        startX = startX || 0;
        startY = startY || 0;
        endX = endX || this.gameMap.width;
        endY = endY || this.gameMap.height;
        for (let i = startX; i < endX; i++) {
            for (let j = startY; j < endY; j++) {
                let x = this.gameMap.offsetWidth + (i * Tilemaps.getTileMap().frameWidth);
                let y = this.gameMap.offsetHeight + (j * Tilemaps.getTileMap().frameHeight);

                var tiles = this.gameMap.locations[i][j].tiles;
                for (var k = 0; k < tiles.length; k++) {
                    var tile = tiles[k];
                    tile.sprite.create(this.scene, x, y, Tilemaps.getTileMap().name);
                }
            }
        }

        for (let i = 0; i < this.gameMap.entities.length; i++) {
            var entity = this.gameMap.entities[i];

            let x = this.gameMap.offsetWidth + (entity.x * Tilemaps.getTileMap().frameWidth);
            let y = this.gameMap.offsetHeight + (entity.y * Tilemaps.getTileMap().frameHeight);

            entity.sprite.create(this.scene, x, y, Tilemaps.getTileMap().name);
        }

        for (let i = startX; i < endX; i++) {
            for (let j = startY; j < endY; j++) {
                let x = this.gameMap.offsetWidth + (i * Tilemaps.getTileMap().frameWidth);
                let y = this.gameMap.offsetHeight + (j * Tilemaps.getTileMap().frameHeight);

                var shroudTile = this.gameMap.shroud[i][j];
                if (shroudTile) {
                    shroudTile.sprite.create(this.scene, x, y, Tilemaps.getTileMap().name);
                }

                var highlightTile = this.gameMap.highlight[i][j];
                if (highlightTile) {
                    highlightTile.sprite.create(this.scene, x, y, Tilemaps.getTileMap().name);
                    highlightTile.render();
                }
            }
        }
    }

    addGameMap(gameMap) {
        if (!this.hasGameMap(gameMap.name)) {
            this.gameMaps[gameMap.name] = gameMap;
        }

        return this.gameMaps[gameMap.name];
    }

    getGameMap(name) {
        if (this.hasGameMap(name)) {
            return this.gameMaps[name];
        }

        return null;
    }

    hasGameMap(name) {
        var gameMap = this.gameMaps[name];
        return gameMap !== undefined;
    }

    removeGameMap(gameMap) {
        delete this.gameMaps[gameMap.name];
    }

    setGameMap(gameMap) {
        this.addGameMap(gameMap);
        this.teardown();
        this.gameMap = gameMap;
    }

    teardown() {
        if (this.gameMap) {
            for (let i = 0; i < this.gameMap.width; i++) {
                for (let j = 0; j < this.gameMap.height; j++) {
                    var tiles = this.gameMap.locations[i][j].tiles;
                    for (var k = 0; k < tiles.length; k++) {
                        var tile = tiles[k];
                        tile.sprite.destroy();
                    }

                    var shroudTile = this.gameMap.shroud[i][j];
                    if (shroudTile) {
                        shroudTile.sprite.destroy();
                    }

                    var highlightTile = this.gameMap.highlight[i][j];
                    if (highlightTile) {
                        highlightTile.sprite.destroy();
                    }
                }
            }

            for (let i = 0; i < this.gameMap.entities.length; i++) {
                var entity = this.gameMap.entities[i];
                entity.sprite.destroy();
            }
        }

        this.lastExploredFovTiles = [];
    }

    handleEnemyTurns() {
        for (var i = 0; i < this.gameMap.entities.length; i++) {
            var entity = this.gameMap.entities[i];

            var isPlayer = false;
            for (var j = 0; j < this.players.length; j++) {
                var player = this.players[j];

                if (entity === player) {
                    isPlayer = true;
                    break;
                }
            }

            if (!isPlayer) {
                if (i % 2 === this.enemyTurn) {
                    if (entity.ai) {
                        entity.ai.perform(true);
                    }
                }
            }
        }

        if (this.enemyTurn == 0) {
            this.enemyTurn = 1;
        } else {
            this.enemyTurn = 0;
        }
    }

    updateFov() {
        var gameMaps = [];

        if (!this.player || this.player.hasSharedVision) {
            for (let i = 0; i < this.players.length; i++) {
                let player = this.players[i];
                var playerGameMap = player.getGameMap();

                if (gameMaps.indexOf(playerGameMap) === -1) {
                    gameMaps.push(playerGameMap);
                }
            }
        } else {
            gameMaps.push(this.gameMap);
        }

        for (let i = 0; i < gameMaps.length; i++) {
            let gameMap = gameMaps[i];
            gameMap.newExploredTiles = [];
            gameMap.newLightSources = [];

            for (let j = 0; j < gameMap.lastExploredFovTiles.length; j++) {
                let tile = gameMap.lastExploredFovTiles[j];
                tile.resetVisible();
            }
        }

        if (!this.player || this.player.hasSharedVision) {
            for (let i = 0; i < this.players.length; i++) {
                let player = this.players[i];
                FovAdamMillazo.compute(player.getGameMap(), player.x, player.y, player.lightRadius);
            }
        } else {
            FovAdamMillazo.compute(this.gameMap, this.player.x, this.player.y, this.player.lightRadius);
        }

        for (let i = 0; i < gameMaps.length; i++) {
            let gameMap = gameMaps[i];

            if (gameMap === this.gameMap) {
                for (let i = 0; i < gameMap.lastExploredFovTiles.length; i++) {
                    let tile = gameMap.lastExploredFovTiles[i];
                    tile.render();
                }

                for (let i = 0; i < gameMap.newExploredTiles.length; i++) {
                    let tile = gameMap.newExploredTiles[i];
                    tile.render();
                }
            }

            gameMap.lastExploredFovTiles = gameMap.newExploredTiles;
        }
    }

    clearFov() {
        this.gameMap.lastExploredFovTiles = [];
        for (var i = 0; i < this.gameMap.width; i++) {
            for (var j = 0; j < this.gameMap.height; j++) {
                this.gameMap.shroud[i][j].explore();
                this.gameMap.shroud[i][j].render();
                this.gameMap.lastExploredFovTiles.push(this.gameMap.shroud[i][j]);
            }
        }
    }
}