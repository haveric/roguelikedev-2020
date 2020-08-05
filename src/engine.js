import { MainGameEventHandler } from "./eventHandler";
import { FovAdamMillazo } from "./fov";
import Tilemaps from "./tilemaps";
import UI from "./ui/ui";

export default class Engine {
    constructor(scene, player, players) {
        const self = this;

        self.scene = scene;
        self.zoomLevel = 1;
        self.debugEnabled = false;

        self.ui = new UI(scene.scene.get("SceneGameUI"), this);
        self.gameMap = null;
        self.gameMaps = {};
        self.player = player;
        self.players = players;

        self.enemyTurn = 0;
    }

    setMainEventHandler() {
        this.eventHandler = new MainGameEventHandler(this.scene.input, this);
    }

    createSprites(startX, startY, endX, endY) {
        startX = startX || 0;
        startY = startY || 0;
        endX = endX || this.gameMap.width;
        endY = endY || this.gameMap.height;
        for (let i = startX; i < endX; i++) {
            for (let j = startY; j < endY; j++) {
                const x = this.gameMap.offsetWidth + (i * Tilemaps.getTileMap().frameWidth);
                const y = this.gameMap.offsetHeight + (j * Tilemaps.getTileMap().frameHeight);

                const tiles = this.gameMap.locations[i][j].tiles;
                for (let k = 0; k < tiles.length; k++) {
                    const tile = tiles[k];
                    tile.sprite.create(this.scene, x, y, Tilemaps.getTileMap().name);
                }
            }
        }

        for (let i = 0; i < this.gameMap.entities.length; i++) {
            const entity = this.gameMap.entities[i];

            const x = this.gameMap.offsetWidth + (entity.x * Tilemaps.getTileMap().frameWidth);
            const y = this.gameMap.offsetHeight + (entity.y * Tilemaps.getTileMap().frameHeight);

            entity.sprite.create(this.scene, x, y, Tilemaps.getTileMap().name);
        }

        for (let i = startX; i < endX; i++) {
            for (let j = startY; j < endY; j++) {
                const x = this.gameMap.offsetWidth + (i * Tilemaps.getTileMap().frameWidth);
                const y = this.gameMap.offsetHeight + (j * Tilemaps.getTileMap().frameHeight);

                const shroudTile = this.gameMap.shroud[i][j];
                if (shroudTile) {
                    shroudTile.sprite.create(this.scene, x, y, Tilemaps.getTileMap().name);
                }

                const highlightTile = this.gameMap.highlight[i][j];
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
        const gameMap = this.gameMaps[name];
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
                    const tiles = this.gameMap.locations[i][j].tiles;
                    for (let k = 0; k < tiles.length; k++) {
                        const tile = tiles[k];
                        tile.sprite.destroy();
                    }

                    const shroudTile = this.gameMap.shroud[i][j];
                    if (shroudTile) {
                        shroudTile.sprite.destroy();
                    }

                    const highlightTile = this.gameMap.highlight[i][j];
                    if (highlightTile) {
                        highlightTile.sprite.destroy();
                    }
                }
            }

            for (let i = 0; i < this.gameMap.entities.length; i++) {
                const entity = this.gameMap.entities[i];
                entity.sprite.destroy();
            }
        }

        this.lastExploredFovTiles = [];
    }

    isEntityAPlayer(entity) {
        for (let i = 0; i < this.players.length; i++) {
            if (entity === this.players[i]) {
                return true;
            }
        }

        return false;
    }

    handleEnemyTurns() {
        for (let i = 0; i < this.gameMap.entities.length; i++) {
            const entity = this.gameMap.entities[i];

            if (!this.isEntityAPlayer(entity)) {
                if (i % 2 === this.enemyTurn) {
                    if (entity.ai) {
                        entity.ai.perform(true);
                    }
                }
            }
        }

        if (this.enemyTurn === 0) {
            this.enemyTurn = 1;
        } else {
            this.enemyTurn = 0;
        }
    }

    updateFov() {
        const gameMaps = [];

        if (!this.player || this.player.hasSharedVision) {
            for (let i = 0; i < this.players.length; i++) {
                const player = this.players[i];
                const playerGameMap = player.getGameMap();

                if (gameMaps.indexOf(playerGameMap) === -1) {
                    gameMaps.push(playerGameMap);
                }
            }
        } else {
            gameMaps.push(this.gameMap);
        }

        for (let i = 0; i < gameMaps.length; i++) {
            const gameMap = gameMaps[i];
            gameMap.newExploredTiles = [];
            gameMap.newLightSources = [];

            for (let j = 0; j < gameMap.lastExploredFovTiles.length; j++) {
                const tile = gameMap.lastExploredFovTiles[j];
                tile.resetVisible();
            }
        }

        if (!this.player || this.player.hasSharedVision) {
            for (let i = 0; i < this.players.length; i++) {
                const player = this.players[i];
                FovAdamMillazo.compute(player.getGameMap(), player.x, player.y, player.lightRadius);
            }
        } else {
            FovAdamMillazo.compute(this.gameMap, this.player.x, this.player.y, this.player.lightRadius);
        }

        for (let i = 0; i < gameMaps.length; i++) {
            const gameMap = gameMaps[i];

            if (gameMap === this.gameMap) {
                for (let i = 0; i < gameMap.lastExploredFovTiles.length; i++) {
                    const tile = gameMap.lastExploredFovTiles[i];
                    tile.render();
                }

                for (let i = 0; i < gameMap.newExploredTiles.length; i++) {
                    const tile = gameMap.newExploredTiles[i];
                    tile.render();
                }
            }

            gameMap.lastExploredFovTiles = gameMap.newExploredTiles;
        }
    }

    clearFov() {
        this.gameMap.lastExploredFovTiles = [];
        for (let i = 0; i < this.gameMap.width; i++) {
            for (let j = 0; j < this.gameMap.height; j++) {
                this.gameMap.shroud[i][j].explore();
                this.gameMap.shroud[i][j].render();
                this.gameMap.lastExploredFovTiles.push(this.gameMap.shroud[i][j]);
            }
        }
    }
}