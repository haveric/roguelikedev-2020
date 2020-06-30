import GameMap from "./gameMap.js";
import Sprite from './sprite.js';
import Tile from './tile.js';
import { create2dArray, getRandomInt } from '../utils.js';

export class RectangularRoom {
    constructor(x, y, width, height) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + width;
        this.y2 = y + height;

        this.tiles = create2dArray(width);
    }

    center() {
        var centerX = Math.floor((this.x1 + this.x2) / 2);
        var centerY = Math.floor((this.y1 + this.y2) / 2);

        return { x: centerX, y: centerY };
    }
}

export function createTestMap(width, height, entities) {
    var dungeon = new GameMap(width, height, entities);
    for (var i = 0; i < dungeon.rows; i++) {
        for (var j = 0; j < dungeon.cols; j++) {
            var color;
            if (i == 0 || i == dungeon.rows - 1 || j == 0 || j == dungeon.cols - 1) {
                color = "333333";

                dungeon.wallTiles[i][j] = new Tile(i, j, "wall", new Sprite("wall", "666666"), false, true);
            } else {
                color = "999999";
            }

            dungeon.floorTiles[i][j] = new Tile(i, j, "floor", new Sprite("floor", color), true, false);
        }
    }

    return dungeon;
}

export function generateDungeon(rows, cols, entities) {
    var dungeon = new GameMap(rows, cols, entities);

    var room1 = new RectangularRoom(10, 5, 10, 15);
    var room2 = new RectangularRoom(25, 5, 10, 15);

    for (var i = room1.x1; i < room1.x2; i++) {
        for (var j = room1.y1; j < room1.y2; j++) {
            var color;
            if (i == room1.x1 || i == room1.x2 - 1 || j == room1.y1 || j == room1.y2 - 1) {
                color = "333333";

                dungeon.wallTiles[i][j] = new Tile(i, j, "wall", new Sprite("wall", "666666"), false, true);
            } else {
                color = "999999";
            }
            dungeon.floorTiles[i][j] = new Tile(i, j, "floor", new Sprite("floor", color), true, false);
        }
    }

    for (var i = room2.x1; i < room2.x2; i++) {
        for (var j = room2.y1; j < room2.y2; j++) {
            var color;
            if (i == room2.x1 || i == room2.x2 - 1 || j == room2.y1 || j == room2.y2 - 1) {
                color = "333333";

                dungeon.wallTiles[i][j] = new Tile(i, j, "wall", new Sprite("wall", "666666"), false, true);
            } else {
                color = "999999";
            }

            dungeon.floorTiles[i][j] = new Tile(i, j, "floor", new Sprite("floor", color), true, false);
        }
    }

    var room1Center = room1.center();
    var room2Center = room2.center();
    tunnelBetween(dungeon, room1Center.x, room1Center.y, room2Center.x, room2Center.y);

    return dungeon;
}

function tunnelBetween(gameMap, x1, y1, x2, y2) {
    if (getRandomInt(0, 1) == 1) {
        // horizontal first, then vertical
        createHorizontalTunnel(gameMap, x1, x2, y1);
        createVerticalTunnel(gameMap, y1, y2, x2);
    } else {
        // vertical first, then horizontal
        createVerticalTunnel(gameMap, y1, y2, x1);
        createHorizontalTunnel(gameMap, x1, x2, y2);
    }
}

function createHorizontalTunnel(gameMap, x1, x2, y) {
    for (var x = Math.min(x1, x2); x < Math.max(x1, x2) + 1; x++) {
        gameMap.floorTiles[x][y] = new Tile(x, y, "floor", new Sprite("floor", "999999"), true, false);
        gameMap.wallTiles[x][y] = null;

        var floorTileAbove = gameMap.floorTiles[x][y-1];
        if (floorTileAbove === undefined) {
            gameMap.floorTiles[x][y-1] = new Tile(x, y-1, "floor", new Sprite("floor", "333333"), true, false);

            var wallTileAbove = gameMap.wallTiles[x][y-1];
            if (wallTileAbove === undefined) {
                gameMap.wallTiles[x][y-1] = new Tile(x, y-1, "wall", new Sprite("wall", "666666"), false, true);
            }
        }

        var floorTileBelow = gameMap.floorTiles[x][y+1];
        if (floorTileBelow === undefined) {
            gameMap.floorTiles[x][y+1] = new Tile(x, y+1, "floor", new Sprite("floor", "333333"), true, false);

            var wallTileBelow = gameMap.wallTiles[x][y+1];
            if (wallTileBelow === undefined) {
                gameMap.wallTiles[x][y+1] = new Tile(x, y+1, "wall", new Sprite("wall", "666666"), false, true);
            }
        }
    }
}

function createVerticalTunnel(gameMap, y1, y2, x) {
    for (var y = Math.min(y1, y2); y < Math.max(y1, y2) + 1; y++) {
        gameMap.floorTiles[x][y] = new Tile(x, y, "floor", new Sprite("floor", "999999"), true, false);
        gameMap.wallTiles[x][y] = null;

        var floorTileLeft = gameMap.floorTiles[x-1][y];
        if (floorTileLeft === undefined) {
            gameMap.floorTiles[x-1][y] = new Tile(x-1, y, "floor", new Sprite("floor", "333333"), true, false);

            var wallTileLeft = gameMap.wallTiles[x-1][y];
            if (wallTileLeft === undefined) {
                gameMap.wallTiles[x-1][y] = new Tile(x-1, y, "wall", new Sprite("wall", "666666"), false, true);
            }
        }

        var floorTileRight = gameMap.floorTiles[x+1][y];
        if (floorTileRight === undefined) {
            gameMap.floorTiles[x+1][y] = new Tile(x+1, y, "floor", new Sprite("floor", "333333"), true, false);

            var wallTileRight = gameMap.wallTiles[x+1][y];
            if (wallTileRight === undefined) {
                gameMap.wallTiles[x+1][y] = new Tile(x+1, y, "wall", new Sprite("wall", "666666"), false, true);
            }
        }
    }
}