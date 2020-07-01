import { create2dArray } from '../utils.js';
import FovTile from './fovTile.js';

export default class GameMap {
    constructor(width, height, entities) {
        this.width = width;
        this.height = height;
        this.entities = entities || [];

        // Offsets to center the map on screen
        this.offsetWidth = 400;
        this.offsetHeight = 300;

        this.floorTiles = create2dArray(this.width);
        this.wallTiles = create2dArray(this.width);

        this.lastExploredFovTiles = [];
        this.shroud = create2dArray(this.width);

        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this.shroud[i][j] = new FovTile(i, j, "shroud");
            }
        }
    }

    getBlockingEntityAtLocation(x, y) {
        var foundEntity = null;
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            if (entity.blocksMovement && entity.x == x && entity.y == y) {
                foundEntity = entity;
                break;
            }
        }

        return foundEntity;
    }
}