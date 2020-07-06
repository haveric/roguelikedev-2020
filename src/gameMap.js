import { create2dArray } from '../utils';
import FovTile from './fovTile';

export default class GameMap {
    constructor(width, height, entities) {
        this.width = width;
        this.height = height;
        this.entities = entities || [];

        // Offsets to center the map on screen
        this.offsetWidth = 400;
        this.offsetHeight = 300;

        this.tiles = create2dArray(this.width);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this.tiles[i][j] = new GameMapLocation();
            }
        }

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

export class GameMapLocation {
    constructor() {
        this.tiles = [];
        this.entities = [];
    }

    addTile(tile) {
        if (!this.tiles.includes(tile)) {
            this.tiles.push(tile);
        }
    }

    clearTiles() {
        this.tiles = [];
    }

    isTileWalkable() {
        var numTiles = this.tiles.length;
        var numWalkable = 0;
        for (var i = 0; i < numTiles; i++) {
            if (this.tiles[i].walkable) {
                numWalkable += 1;
            } else {
                break;
            }
        }

        return numTiles > 0 && numWalkable === numTiles;
    }

    isTileBlockingFOV() {
        var numTiles = this.tiles.length;
        var anyBlocking = false;
        for (var i = 0; i < numTiles; i++) {
            if (this.tiles[i].blockFOV) {
                anyBlocking = true;
                break;
            }
        }

        return numTiles > 0 && anyBlocking;
    }

    tileComponentRun(component, toRun) {
        for (var i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i][component]) {
                this.tiles[i][component][toRun]();
                return true;
            }
        }

        return false;
    }

    addEntity(entity) {
        if (!this.entities.includes(entity)) {
            this.entities.push(entity);
        }
    }
}