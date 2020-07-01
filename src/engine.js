import { computeFovSimple } from './fov.js';

export default class Engine {
    constructor(eventHandler, gameMap, tilemap, player, otherPlayers) {
        var self = this;
        self.eventHandler = eventHandler;
        self.gameMap = gameMap;
        self.tilemap = tilemap;
        self.player = player;
        self.otherPlayers = otherPlayers;

        self.players = [];
        self.players.push(self.player);
        for (var i = 0; i < self.otherPlayers.length; i++) {
            self.players.push(self.otherPlayers[i]);
        }

        self.enemyTurn = 0;
    }

    createSprites(scene) {
        for (var i = 0; i < this.gameMap.width; i++) {
            for (var j = 0; j < this.gameMap.height; j++) {
                var x = this.gameMap.offsetWidth + (i * this.tilemap.frameWidth);
                var y = this.gameMap.offsetHeight + (j * this.tilemap.frameHeight);

                var floorTile = this.gameMap.floorTiles[i][j];
                if (floorTile) {
                    floorTile.sprite.create(scene, x, y, this.tilemap.name);
                }

                var wallTile = this.gameMap.wallTiles[i][j];
                if (wallTile) {
                    wallTile.sprite.create(scene, x, y, this.tilemap.name);
                }
            }
        }

        for (var i = 0; i < this.gameMap.entities.length; i++) {
            var entity = this.gameMap.entities[i];

            var x = this.gameMap.offsetWidth + (entity.x * this.tilemap.frameWidth);
            var y = this.gameMap.offsetHeight + (entity.y * this.tilemap.frameHeight);

            entity.sprite.create(scene, x, y, this.tilemap.name);
        }

        for (var i = 0; i < this.gameMap.width; i++) {
            for (var j = 0; j < this.gameMap.height; j++) {
                var x = this.gameMap.offsetWidth + (i * this.tilemap.frameWidth);
                var y = this.gameMap.offsetHeight + (j * this.tilemap.frameHeight);

                var shroudTile = this.gameMap.shroud[i][j];
                if (shroudTile) {
                    shroudTile.sprite.create(scene, x, y, this.tilemap.name);
                }
            }
        }
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
                if (i % this.enemyTurn == 0) {
                    console.log("The " + entity.name + " wonders when it will get to take a real turn.");
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
        for (var i = 0; i < this.gameMap.lastExploredFovTiles.length; i++) {
            var tile = this.gameMap.lastExploredFovTiles[i];
            tile.resetVisible();
        }

        var newExploredTiles = [];
        if (this.player.hasSharedVision) {
            for (var i = 0; i < this.players.length; i++) {
                var player = this.players[i];
                computeFovSimple(this.gameMap, newExploredTiles, player.x, player.y, player.lightRadius);
            }
        } else {
            computeFovSimple(this.gameMap, newExploredTiles, this.player.x, this.player.y, this.player.lightRadius);
        }

        for (var i = 0; i < this.gameMap.lastExploredFovTiles.length; i++) {
            var tile = this.gameMap.lastExploredFovTiles[i];
            tile.render();
        }

        for (var i = 0; i < newExploredTiles.length; i++) {
            var tile = newExploredTiles[i];
            tile.render();
        }

        this.gameMap.lastExploredFovTiles = newExploredTiles;
    }
}