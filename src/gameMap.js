import { create2dArray } from '../utils.js';

export default class GameMap {
    constructor(rows, cols, entities) {
        this.rows = rows;
        this.cols = cols;
        this.entities = entities || [];

        // Offsets to center the map on screen
        this.offsetWidth = 400;
        this.offsetHeight = 300;

        this.floorTiles = create2dArray(this.rows);
        this.wallTiles = create2dArray(this.rows);
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