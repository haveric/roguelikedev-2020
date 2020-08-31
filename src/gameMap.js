import { create2dArray } from "./utils/utils";
import FovTile from "./entity/fovTile";
import HighlightTile from "./entity/highlightTile";
import Tilemaps from "./tilemaps";
import Actor from "./entity/actor";
import Item from "./entity/item";

export default class GameMap {
    constructor(engine, name, width, height) {
        this.engineRef = engine;
        this.name = name;
        this.width = width;
        this.height = height;
        this.entities = [];

        // Add a full map offset to allow for top and left sides to have blank space and zoom to be centered
        this.offsetWidth = this.width * Tilemaps.getTileMap().frameWidth;
        this.offsetHeight = this.height * Tilemaps.getTileMap().frameHeight;

        this.lastExploredFovTiles = [];
        this.locations = create2dArray(this.width);
        this.shroud = create2dArray(this.width);
        this.highlight = create2dArray(this.width);
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.locations[i][j] = new GameMapLocation(this);
                this.shroud[i][j] = new FovTile(i, j);
                this.shroud[i][j].parent = this;

                this.highlight[i][j] = new HighlightTile(i, j);
                this.highlight[i][j].parent = this;
            }
        }
    }

    // Used for reference in entity parents
    getGameMap() {
        return this;
    }

    /**
     * @returns {Array<Array<FovTile>}
     */
    getShroud() {
        return this.shroud;
    }

    getBlockingEntityAtLocation(x, y) {
        let foundEntity = null;
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity.blocksMovement && entity.x === x && entity.y === y) {
                foundEntity = entity;
                break;
            }
        }

        return foundEntity;
    }

    getNonBlockingEntitiesAtLocation(x, y) {
        const entities = [];
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (!entity.blocksMovement && entity.x === x && entity.y === y) {
                entities.push(entity);
            }
        }

        entities.sort(_entityDepthCompare);

        return entities;
    }

    getActors() {
        const actors = [];
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity instanceof Actor && entity.isAlive()) {
                actors.push(entity);
            }
        }

        return actors;
    }

    getItems() {
        const items = [];
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity instanceof Item) {
                items.push(entity);
            }
        }

        return items;
    }

    getPriorityDeadActorAtLocation(x, y) {
        const players = this.engineRef.players;
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (!player.isAlive() && player.x === x && player.y === y) {
                return player;
            }
        }

        const entities = this.getGameMap().entities;
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity instanceof Actor && !entity.isAlive() && entity.x === x && entity.y === y) {
                return entity;
            }
        }

        return null;
    }

    getActorAtLocation(x, y) {
        const actors = this.getActors();
        for (let i = 0; i < actors.length; i++) {
            const actor = actors[i];
            if (actor.x === x && actor.y === y) {
                return actor;
            }
        }

        return null;
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }

    addEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index === -1) {
            this.entities.push(entity);
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
    constructor(gameMap) {
        this.gameMap = gameMap;
        this.tiles = [];
        this.entities = [];
    }

    addTile(tile) {
        if (!this.tiles.includes(tile)) {
            tile.parent = this.gameMap;
            this.tiles.push(tile);
            this.tiles.sort(_entityDepthCompare);
        }
    }

    clearTiles() {
        this.tiles = [];
    }

    isTileWalkable() {
        const numTiles = this.tiles.length;
        let numWalkable = 0;
        for (let i = 0; i < numTiles; i++) {
            if (this.tiles[i].walkable) {
                numWalkable += 1;
            } else {
                break;
            }
        }

        return numTiles > 0 && numWalkable === numTiles;
    }

    isTileAtDepth(depth) {
        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];

            if (tile.renderOrder === depth) {
                return true;
            }
        }

        return false;
    }

    isTileBlockingFOV() {
        const numTiles = this.tiles.length;
        let anyBlocking = false;
        for (let i = 0; i < numTiles; i++) {
            if (this.tiles[i].blockFOV) {
                anyBlocking = true;
                break;
            }
        }

        return numTiles > 0 && anyBlocking;
    }

    tileHasComponent(component) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i][component]) {
                return true;
            }
        }

        return false;
    }

    tileComponentCheck(component, toRun) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i][component]) {
                return this.tiles[i][component][toRun]();
            }
        }

        return null;
    }

    tileComponentRun(component, toRun) {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i][component]) {
                this.tiles[i][component][toRun]();
                return true;
            }
        }

        return null;
    }

    addEntity(entity) {
        if (!this.entities.includes(entity)) {
            this.entities.push(entity);
        }
    }
}