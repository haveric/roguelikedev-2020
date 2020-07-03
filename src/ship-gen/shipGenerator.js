import Srand from 'seeded-rand';
import GameMap from "../gameMap.js";
import EntityFactories from '../entityFactories.js';
import Tiles from './tilefactories';
import {RoomConstants, BreachRoom, Bridge, RoomTypeFactories, RectangularRoom } from './roomTypes';

export class GeneratorOptions {

    constructor(
        minRooms,
        maxRooms, 
        roomMinSize,
        roomMaxSize,
        width,
        height,
        holds,
        maxMonstersPerRoom)          
    {
        this.minRooms = minRooms;
        this.maxRooms = maxRooms;
        this.roomMinSize = roomMinSize;
        this.roomMaxSize = roomMaxSize;
        this.width = width;
        this.height = height;
        this.holds = holds;
        this.maxMonstersPerRoom = maxMonstersPerRoom;
    }
}

export class Ship {

    constructor(gameMap, shipOptions) {
        this.gameMap = gameMap;
        this.shipOptions = shipOptions;
        this.rooms = [];
    }

    // Generates a game map with no players inside
    generateDungeon() {
        this.gameMap = new GameMap(this.shipOptions.width, this.shipOptions.height, this.gameMap.entities);

        // create breach room near center left of map
        var breachX2 = Math.floor((this.shipOptions.height / 2) - (RoomConstants.baseBreachHeight / 2))
        var breachRoom = new BreachRoom(0, breachX2);
        this._createRoom(breachRoom);
        this.rooms.push(breachRoom);

        // add test lights
        this.gameMap.wallTiles[breachRoom.x1 + 1][breachRoom.y1 + 1] = Tiles.redTorch(breachRoom.x1 + 1, breachRoom.y1 + 1);
        this.gameMap.wallTiles[breachRoom.x2 - 2][breachRoom.y1 + 1] = Tiles.yellowTorch(breachRoom.x2 - 2, breachRoom.y1 + 1);

        // split ship into vertical sections for hold areas
        var holdGenerationYMin = Math.floor(this.shipOptions.height / 3)
        var holdGenerationYMax = holdGenerationYMin * 2;
        var holdGenerationXSegmentSize = Math.floor(this.shipOptions.width / this.shipOptions.holds); 
        var holdGenerationXMin = 6;
        var holdGenerationXMax = holdGenerationXSegmentSize;

        var previousMainRoom = breachRoom;

        for (var h = 1; h <= this.shipOptions.holds; h++) {
            // generate hold sections in the middle 3rd y-zone of the game area
            var validHold = false;
            console.log('Generating hold ' + h + '...');
            while(!validHold) {
                // keep trying to generate a hold until it works!
                var xLoc = Srand.intInRange(holdGenerationXMin, Math.min(this.gameMap.width - RoomConstants.holdWidth - 1, holdGenerationXMax));
                var yLoc = Srand.intInRange(holdGenerationYMin, holdGenerationYMax);
                var hold = RoomTypeFactories.createHold(xLoc, yLoc);

                validHold = !this._doesThisIntersectWithOtherRooms(hold);
                if(!validHold) {
                    continue;
                }

                this._createRoom(hold);
                this._tunnelBetweenRooms(previousMainRoom, hold);
                this.rooms.push(hold);

                // generate 4 side rooms off of each hold
                console.log('Generating rooms for hold ' + h + '...');
                for (var r = 0; r < 4; r++) {
                    var validRoom = false;
                    while(!validRoom) {
                        var roomWidth = Srand.intInRange(this.shipOptions.roomMinSize, this.shipOptions.roomMaxSize);
                        var roomHeight = Srand.intInRange(this.shipOptions.roomMinSize, this.shipOptions.roomMaxSize);
                
                        xLoc = Srand.intInRange(holdGenerationXMin, Math.min(this.gameMap.width - roomWidth - 1, holdGenerationXMax));
                        yLoc = Srand.intInRange(0, this.gameMap.height - roomHeight - 1);
                
                        var room = new RectangularRoom(xLoc, yLoc, roomWidth, roomHeight);

                        validRoom = !this._doesThisIntersectWithOtherRooms(room);
                        if(!validRoom) {
                            continue;
                        }

                        this._createRoom(room);
                        this._tunnelBetweenRooms(hold, room);
                        this.rooms.push(room);
                    } 
                    
                }

                holdGenerationXMin = holdGenerationXMax;
                holdGenerationXMax += holdGenerationXSegmentSize;
                previousMainRoom = hold;
            }
        }

        var validBridge = false;
        console.log('Creating bridge...')
        while(!validBridge) {
            var xLoc = Srand.intInRange(this.gameMap.width - holdGenerationXSegmentSize, this.gameMap.width - RoomConstants.bridgeWidth - 1);
            var yLoc = Srand.intInRange(holdGenerationYMin, Math.min(holdGenerationYMax, this.gameMap.height - RoomConstants.bridgeHeight - 1));
            var bridge = new Bridge(xLoc, yLoc);
            validBridge = !this._doesThisIntersectWithOtherRooms(bridge);
            if(!validBridge) {
                continue;
            }
            this._createRoom(bridge);
            this._tunnelBetweenRooms(previousMainRoom, bridge);
            this.rooms.push(bridge);
        }


        for (var i = 1; i < this.rooms.length; i++) {
            this.placeEntitiesInRoom(this.rooms[i]);
        }

        return this.gameMap;
    }

    _doesThisIntersectWithOtherRooms(roomToCheck) {
        for (var j = 0; j < this.rooms.length; j++) {
            var otherRoom = this.rooms[j];
            if(roomToCheck.intersects(otherRoom)) {
                return true;
            }
        }
        return false;
    }

    _createRoom(newRoom) {
        // Create Room in map
        for (var x = newRoom.x1; x < newRoom.x2; x++) {
            for (var y = newRoom.y1; y < newRoom.y2; y++) {
                var hasWallBefore = this.gameMap.wallTiles[x][y];
                var hasFloorBefore = this.gameMap.floorTiles[x][y];
                var hasPreexistingOpenSpace = hasFloorBefore && !hasWallBefore;

                if (x == newRoom.x1 || x == newRoom.x2 - 1 || y == newRoom.y1 || y == newRoom.y2 - 1) {
                    if (!hasPreexistingOpenSpace) {
                        this.gameMap.wallTiles[x][y] = Tiles.wall(x, y);
                        this.gameMap.floorTiles[x][y] = Tiles.darkFloor(x, y);
                    }
                } else {
                    this.gameMap.wallTiles[x][y] = null;
                    this.gameMap.floorTiles[x][y] = Tiles.lightFloor(x, y);
                }
            }
    
            this.rooms.push(newRoom);
        }

        console.log('Created room: ' + newRoom);
        return newRoom;
    }

    _tunnelBetweenRooms(room1, room2) {
        var lastRoomCenter = room1.center();
        var newRoomCenter = room2.center();
        this._tunnelBetween(lastRoomCenter.x, lastRoomCenter.y, newRoomCenter.x, newRoomCenter.y);
    }

    // Sets the player coordinates based on the first room.
    setPlayerCoordinates(players) {
        var firstRoomCenter = this.rooms[0].center();
        for (var j = 0; j < players.length; j++) {
            var player = players[j];
            player.x = firstRoomCenter.x + j;
            player.y = firstRoomCenter.y;
        }
        return players;
    }

    placeEntitiesInRoom(rectangularRoom) {
        var numToSpawn = Srand.intInRange(0, this.shipOptions.maxMonstersPerRoom);
    
        for (var i = 0; i < numToSpawn; i++) {
            var x = Srand.intInRange(rectangularRoom.x1 + 1, rectangularRoom.x2 - 2);
            var y = Srand.intInRange(rectangularRoom.y1 + 1, rectangularRoom.y2 - 2);
    
            var entity = this.gameMap.getBlockingEntityAtLocation(x, y);
            if (!entity) {
                var random = Srand.random();
    
                if (random < 0.7) {
                    EntityFactories.attackDog.spawn(this.gameMap, x, y);
                } else if (random < 0.95) {
                    EntityFactories.spacePirate.spawn(this.gameMap, x, y);
                } else {
                    EntityFactories.automatedTurret.spawn(this.gameMap, x, y);
                }
            }
        }
    }

    _tunnelBetween(x1, y1, x2, y2) {
        if (Srand.intInRange(0, 1) == 1) {
            // horizontal first, then vertical
            this._createTunnel(x1, x2, y1, true);
            this._createTunnel(y1, y2, x2, false);
        } else {
            // vertical first, then horizontal
            this._createTunnel(y1, y2, x1, false);
            this._createTunnel(x1, x2, y2, true);
        }
    }

    _createTunnel(axisStart, axisEnd, otherAxis, isHorizontal) {
        const start = Math.min(axisStart, axisEnd);
        const end =  Math.max(axisStart, axisEnd);
        for (var axisCoord = start; axisCoord <= end; axisCoord++) {
            var x = isHorizontal ? axisCoord : otherAxis;
            var y = isHorizontal ? otherAxis : axisCoord;

            this.gameMap.floorTiles[x][y] = Tiles.lightFloor(x, y);
            this.gameMap.wallTiles[x][y] = null; // remove any wall
    
            var xCheckTile1 = isHorizontal ? x : x - 1;
            var yCheckTile1 = isHorizontal ? y - 1 : y;
            this._tunnelAdjacent(xCheckTile1, yCheckTile1);
    
            var xCheckTile2 = isHorizontal ? x : x + 1;
            var yCheckTile2 = isHorizontal ? y + 1 : y;
            this._tunnelAdjacent(xCheckTile2, yCheckTile2);
        }
    }

    _tunnelAdjacent(x, y) {
        // do not place a wall if there is already an open floor here
        var floorTileAdjacent = this.gameMap.floorTiles[x][y];
        var wallTileAdjacent = this.gameMap.wallTiles[x][y];
        if (!floorTileAdjacent && !wallTileAdjacent) {
            this.gameMap.wallTiles[x][y] = Tiles.wall(x, y);
            this.gameMap.floorTiles[x][y] = Tiles.darkFloor(x, y);
        }
    }
}