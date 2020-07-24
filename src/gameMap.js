import { create2dArray } from '../utils';
import FovTile from './fovTile';
import HighlightTile from './highlightTile';
import { Actor, Item } from './entity';
import Tilemaps from './tilemaps';

export default class GameMap {
    constructor(engine, width, height, entities) {
        this.engineRef = engine;
        this.width = width;
        this.height = height;
        this.entities = entities || [];

        // Add a full map offset to allow for top and left sides to have blank space and zoom to be centered
        this.offsetWidth = this.width * Tilemaps.getTileMap().frameWidth;
        this.offsetHeight = this.height * Tilemaps.getTileMap().frameHeight;

        this.locations = create2dArray(this.width);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this.locations[i][j] = new GameMapLocation();
            }
        }

        this.lastExploredFovTiles = [];
        this.shroud = create2dArray(this.width);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this.shroud[i][j] = new FovTile(i, j, "shroud");
            }
        }

        this.highlight = create2dArray(this.width);
        for (var i = 0; i < this.width; i++) {
            for (var j = 0; j < this.height; j++) {
                this.highlight[i][j] = new HighlightTile(i, j, "highlight");
            }
        }
    }

    // Used for reference in entity parents
    getGameMap() {
        return this;
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

    getNonBlockingEntitiesAtLocation(x, y) {
        var entities = [];
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            if (!entity.blocksMovement && entity.x == x && entity.y == y) {
                entities.push(entity);
            }
        }

        this.entities.sort(_entityDepthCompare);

        return entities;
    }

    getActors() {
        var actors = [];
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            if (entity instanceof Actor && entity.isAlive()) {
                actors.push(entity);
            }
        }

        return actors;
    }

    getItems() {
        var items = [];
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];
            if (entity instanceof Item) {
                items.push(entity);
            }
        }

        return items;
    }

    getActorAtLocation(x, y) {
        var actors = this.getActors();
        for (var i = 0; i < actors.length; i++) {
            var actor = actors[i];
            if (actor.x == x && actor.y == y) {
                return actor;
            }
        }

        return null;
    }

    removeEntity(entity) {
        var index = this.entities.indexOf(entity);
        if (index != -1) {
            this.entities.splice(index, 1);
        }
    }
}

function _entityDepthCompare(a, b) {
    if (a.renderOrder < b.renderOrder) {
        return 1;
    }

    if (a.renderOrder > b.renderOrder) {
        return -1;
    }

    return 0;
}

export class GameMapLocation {
    constructor() {
        this.tiles = [];
        this.entities = [];
    }

    addTile(tile) {
        if (!this.tiles.includes(tile)) {
            this.tiles.push(tile);
            this.tiles.sort(_entityDepthCompare);
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

    isTileAtDepth(depth) {
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];

            if (tile.renderOrder === depth) {
                return true;
            }
        }

        return false;
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

    tileComponentCheck(component, toRun) {
        for (var i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i][component]) {
                return this.tiles[i][component][toRun]();
            }
        }

        return false;
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