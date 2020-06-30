export default class Engine {
    constructor(entities, eventHandler, gameMap, tilemap, player, otherPlayers) {
        var self = this;
        self.entities = entities;
        self.eventHandler = eventHandler;
        self.gameMap = gameMap;
        self.tilemap = tilemap;
        self.player = player;
        self.otherPlayers = otherPlayers;
    }

    createSprites(scene) {
        for (var i = 0; i < this.gameMap.rows; i++) {
            for (var j = 0; j < this.gameMap.cols; j++) {
                var x = this.gameMap.offsetWidth + (i * this.tilemap.frameWidth);
                var y = this.gameMap.offsetHeight + (j * this.tilemap.frameHeight);
                this.gameMap.tiles[i][j].sprite.create(scene, x, y, this.tilemap.name);
            }
        }

        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            var x = this.gameMap.offsetWidth + (entity.x * this.tilemap.frameWidth);
            var y = this.gameMap.offsetHeight + (entity.y * this.tilemap.frameHeight);

            entity.sprite.create(scene, x, y, this.tilemap.name);
        }
    }
}