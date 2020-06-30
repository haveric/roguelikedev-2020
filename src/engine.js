export default class Engine {
    constructor(eventHandler, gameMap, tilemap, player, otherPlayers) {
        var self = this;
        self.eventHandler = eventHandler;
        self.gameMap = gameMap;
        self.tilemap = tilemap;
        self.player = player;
        self.otherPlayers = otherPlayers;
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
    }
}