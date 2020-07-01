import Srand from 'seeded-rand';
import GameMap from "./gameMap.js";
import Sprite from './sprite.js';
import Tile from './tile.js';
import { create2dArray } from '../utils.js';
import EntityFactories from './entityFactories.js';

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

    intersects(rectangularRoom) {
        return this.x1 <= rectangularRoom.x2
            && this.x2 >= rectangularRoom.x1
            && this.y1 <= rectangularRoom.y2
            && this.y2 >= rectangularRoom.y1;
    }
}

export function createTestMap(width, height, entities) {
    var dungeon = new GameMap(width, height, entities);
    for (var i = 0; i < dungeon.width; i++) {
        for (var j = 0; j < dungeon.height; j++) {
            var color;
            if (i == 0 || i == dungeon.width - 1 || j == 0 || j == dungeon.height - 1) {
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

export function generateDungeonSimple(width, height, entities) {
    var dungeon = new GameMap(width, height, entities);

    var room1 = new RectangularRoom(10, 5, 10, 15);
    var room2 = new RectangularRoom(25, 5, 10, 15);

    var rooms = [];
    rooms.push(room1);
    rooms.push(room2);

    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];

        for (var x = room.x1; x < room.x2; x++) {
            for (var y = room.y1; y < room.y2; y++) {
                var color;
                if (x == room.x1 || x == room.x2 - 1 || y == room.y1 || y == room.y2 - 1) {
                    color = "333333";

                    dungeon.wallTiles[x][y] = new Tile(x, y, "wall", new Sprite("wall", "666666"), false, true);
                } else {
                    color = "999999";
                }
                dungeon.floorTiles[x][y] = new Tile(x, y, "floor", new Sprite("floor", color), true, false);
            }
        }
    }

    var room1Center = room1.center();
    var room2Center = room2.center();
    tunnelBetween(dungeon, room1Center.x, room1Center.y, room2Center.x, room2Center.y);

    return dungeon;
}

export function generateDungeon(maxRooms, roomMinSize, roomMaxSize, width, height, maxMonstersPerRoom, entities, players) {
    var dungeon = new GameMap(width, height, entities);

    var rooms = [];

    for (var i = 0; i < maxRooms; i++) {
        var roomWidth = Srand.intInRange(roomMinSize, roomMaxSize);
        var roomHeight = Srand.intInRange(roomMinSize, roomMaxSize);

        var x = Srand.intInRange(0, dungeon.width - roomWidth - 1);
        var y = Srand.intInRange(0, dungeon.height - roomHeight - 1);

        var newRoom = new RectangularRoom(x, y, roomWidth, roomHeight);

        var validRoom = true;
        for (j = 0; j < rooms.length; j++) {
            var room = rooms[j];
            if (newRoom.intersects(room)) {
                validRoom = false;
                break;
            }
        }

        if (!validRoom) {
            continue;
        }

        // Create Room
        for (var x = newRoom.x1; x < newRoom.x2; x++) {
            for (var y = newRoom.y1; y < newRoom.y2; y++) {
                var color;
                var hasWallBefore = dungeon.wallTiles[x][y];
                var hasFloorBefore = dungeon.floorTiles[x][y];
                var hasPreexistingOpenSpace = hasFloorBefore && !hasWallBefore;

                if (x == newRoom.x1 || x == newRoom.x2 - 1 || y == newRoom.y1 || y == newRoom.y2 - 1) {
                    if (!hasPreexistingOpenSpace) {
                        dungeon.wallTiles[x][y] = new Tile(x, y, "wall", new Sprite("wall", "666666"), false, true);
                        dungeon.floorTiles[x][y] = new Tile(x, y, "floor", new Sprite("floor", "333333"), true, false);
                    }
                } else {
                    dungeon.wallTiles[x][y] = null;
                    dungeon.floorTiles[x][y] = new Tile(x, y, "floor", new Sprite("floor", "999999"), true, false);
                }
            }
        }

        if (i == 0) {
            var newRoomCenter = newRoom.center();
            for (var j = 0; j < players.length; j++) {
                var player = players[j];
                player.x = newRoomCenter.x + j;
                player.y = newRoomCenter.y;
            }
        } else {
            var lastRoom = rooms[rooms.length - 1];
            var lastRoomCenter = lastRoom.center();
            var newRoomCenter = newRoom.center();

            tunnelBetween(dungeon, lastRoomCenter.x, lastRoomCenter.y, newRoomCenter.x, newRoomCenter.y);

            placeEntities(newRoom, dungeon, maxMonstersPerRoom);
        }

        rooms.push(newRoom);
    }

    return dungeon;
}

function tunnelBetween(gameMap, x1, y1, x2, y2) {
    if (Srand.intInRange(0, 1) == 1) {
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

function placeEntities(rectangularRoom, gameMap, maxMonstersPerRoom) {
    var numToSpawn = Srand.intInRange(0, maxMonstersPerRoom);

    for (var i = 0; i < numToSpawn; i++) {
        var x = Srand.intInRange(rectangularRoom.x1 + 1, rectangularRoom.x2 - 1);
        var y = Srand.intInRange(rectangularRoom.y1 + 1, rectangularRoom.y2 - 1);

        var entity = gameMap.getBlockingEntityAtLocation(x, y);
        if (!entity) {
            var random = Srand.random();

            if (random < 0.7) {
                EntityFactories.attackDog.spawn(gameMap, x, y);
            } else if (random < 0.95) {
                EntityFactories.spacePirate.spawn(gameMap, x, y);
            } else {
                EntityFactories.automatedTurret.spawn(gameMap, x, y);
            }
        }
    }
}