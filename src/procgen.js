import GameMap from "./gameMap.js";
import Sprite from './sprite.js';
import Tile from './tile.js';
import { create2dArray } from '../utils.js';

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

export function createTestMap(rows, cols, entities) {
    var dungeon = new GameMap(rows, cols, entities);
    for (var i = 0; i < dungeon.rows; i++) {
        for (var j = 0; j < dungeon.cols; j++) {
            var color;
            if (i == 0 || i == dungeon.rows - 1 || j == 0 || j == dungeon.cols - 1) {
                color = "333333";

                dungeon.wallTiles[i][j] = new Tile(i, j, "wall", new Sprite("wall", "666666"), false, false);
            } else {
                color = "999999";
            }

            dungeon.floorTiles[i][j] = new Tile(i, j, "floor", new Sprite("floor", color), true, true);
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

                dungeon.wallTiles[i][j] = new Tile(i, j, "wall", new Sprite("wall", "666666"), false, false);
            } else {
                color = "999999";
            }
            dungeon.floorTiles[i][j] = new Tile(i, j, "floor", new Sprite("floor", color), true, true);
        }
    }

    for (var i = room2.x1; i < room2.x2; i++) {
        for (var j = room2.y1; j < room2.y2; j++) {
            var color;
            if (i == room2.x1 || i == room2.x2 - 1 || j == room2.y1 || j == room2.y2 - 1) {
                color = "333333";

                dungeon.wallTiles[i][j] = new Tile(i, j, "wall", new Sprite("wall", "666666"), false, false);
            } else {
                color = "999999";
            }

            dungeon.floorTiles[i][j] = new Tile(i, j, "floor", new Sprite("floor", color), true, true);
        }
    }

    return dungeon;
}