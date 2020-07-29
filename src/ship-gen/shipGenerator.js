import Srand from "seeded-rand";
import GameMap from "../gameMap";
import EntityFactories from "../entityFactories";
import RenderOrder from "../renderOrder";
import Tiles from "./tilefactories";
import { RoomConstants, BreachRoom, Bridge, RoomTypeFactories, RectangularRoom } from "./roomTypes";
import { RoomTunneler } from "./roomTunneler.js";

export class GeneratorOptions {
    constructor(
        minRooms,
        maxRooms,
        roomMinSize,
        roomMaxSize,
        width,
        height,
        holds,
        maxMonstersPerRoom,
        maxItemsPerRoom) {
        this.minRooms = minRooms;
        this.maxRooms = maxRooms;
        this.roomMinSize = roomMinSize;
        this.roomMaxSize = roomMaxSize;
        this.width = width;
        this.height = height;
        this.holds = holds;
        this.maxMonstersPerRoom = maxMonstersPerRoom;
        this.maxItemsPerRoom = maxItemsPerRoom;
    }
}

export class Ship {
    constructor(engine, shipOptions) {
        this.engineRef = engine;
        this.shipOptions = shipOptions;
        this.rooms = [];
        this.breachRoom = null;
        this.bridge = null;
    }

    // Generates a game map with no players inside
    generateDungeon() {
        const name = "ship-" + Srand.intInRange(100000000, 999999999);
        this.gameMap = new GameMap(this.engineRef, name, this.shipOptions.width, this.shipOptions.height);

        // create breach room near center left of map
        const breachX2 = Math.floor((this.shipOptions.height / 2) - (RoomConstants.baseBreachHeight / 2));
        const breachRoom = new BreachRoom(0, breachX2);
        this.breachRoom = this._createRoom(this.gameMap, breachRoom);
        this.rooms.push(breachRoom);

        const holdGenerationYMin = Math.floor(this.shipOptions.height / 4);
        const holdGenerationYMax = holdGenerationYMin * 2;

        // generate bridge somewhere on the right side of the map near the middle
        let validBridge = false;
        console.log("Generating bridge between x: " + holdGenerationXMin + " - "
            + this.gameMap.width + " and y: " + holdGenerationYMin + " - " + holdGenerationYMax);

        let tries = 0;
        let bridge;
        while(!validBridge) {
            const xLoc = this.gameMap.width - RoomConstants.bridgeWidth - 1;
            const yLoc = Srand.intInRange(holdGenerationYMin, holdGenerationYMax);
            bridge = new Bridge(xLoc, yLoc);
            validBridge = !this._doesThisIntersectWithOtherRooms(bridge);
            if(!validBridge) {
                tries++;
                if(tries > 20) {
                    console.log("Unable to generate bridge");
                    break;
                }
                continue;
            }
            this._createRoom(this.gameMap, bridge);
            this.rooms.push(bridge);
        }

        // split ship into vertical sections for hold areas
        // main rooms are generated in the middle vertical half of the ship
        const usableWidth = this.shipOptions.width - RoomConstants.baseBreachWidth - RoomConstants.bridgeWidth - 1;
        const holdGenerationXSegmentSize = Math.floor(usableWidth / this.shipOptions.holds);
        let holdGenerationXMin = RoomConstants.baseBreachWidth + 1;
        let holdGenerationXMax = holdGenerationXSegmentSize + holdGenerationXMin;

        let previousMainRoom = breachRoom;

        for (let h = 1; h <= this.shipOptions.holds; h++) {
            // generate hold sections in the middle 3rd y-zone of the game area
            let validHold = false;
            console.log("Generating hold " + h + " between x: " + holdGenerationXMin
                + " - " + holdGenerationXMax + " and y: " + holdGenerationYMin + " - " + holdGenerationYMax);
            tries = 0;
            while(!validHold) {
                // keep trying to generate a hold until it works!
                const xLoc = Srand.intInRange(holdGenerationXMin, holdGenerationXMax - RoomConstants.holdWidth);
                const yLoc = Srand.intInRange(holdGenerationYMin, holdGenerationYMax) - RoomConstants.holdHeight;
                const hold = RoomTypeFactories.createHold(xLoc, yLoc);

                validHold = !this._doesThisIntersectWithOtherRooms(hold);
                if(!validHold) {
                    tries++;
                    if(tries > 10) {
                        console.log("Unable to generate hold " + h);
                        break;
                    }
                    continue;
                }

                this._createRoom(this.gameMap, hold);
                this.rooms.push(hold);
                this._tunnelBetweenRooms(previousMainRoom, hold);

                // generate 4 side rooms off of each hold
                console.log("Generating rooms for hold " + h + "...");
                for (let r = 0; r < 4; r++) {
                    let validRoom = false;
                    tries = 0;
                    while(!validRoom) {
                        const roomWidth = Srand.intInRange(this.shipOptions.roomMinSize, this.shipOptions.roomMaxSize);
                        const roomHeight = Srand.intInRange(this.shipOptions.roomMinSize, this.shipOptions.roomMaxSize);

                        const xMax = Math.min(this.gameMap.width - roomWidth, holdGenerationXMax);
                        const xLoc = Srand.intInRange(holdGenerationXMin, xMax);
                        const yLoc = Srand.intInRange(0, this.gameMap.height - roomHeight - 1);

                        const room = new RectangularRoom(xLoc, yLoc, roomWidth, roomHeight, "POI" + h + "" + r);

                        validRoom = !this._doesThisIntersectWithOtherRooms(room);
                        if(!validRoom) {
                            tries++;
                            if(tries > 10) {
                                console.log("Unable to generate room " + r);
                                break;
                            }
                            continue;
                        }

                        this._createRoom(this.gameMap, room);
                        this.rooms.push(room);
                        this._tunnelBetweenRooms(hold, room);
                    }
                }

                tries = 0;
                holdGenerationXMin = holdGenerationXMax;
                holdGenerationXMax += holdGenerationXSegmentSize;
                previousMainRoom = hold;
            }
        }

        this._tunnelBetweenRooms(previousMainRoom, bridge);

        for (let i = 1; i < this.rooms.length; i++) {
            this.placeEntitiesInRoom(this.rooms[i]);
        }

        return this.gameMap;
    }

    _tunnelBetweenRooms(room1, room2) {
        const tunneler = new RoomTunneler(this.gameMap, this.rooms, room1, room2);
        tunneler.tunnelBetweenRooms();
    }

    createDebugMap() {
        if (!this.engineRef.hasGameMap("DEBUG")) {
            const debugGameMap = new GameMap(this.engineRef, "DEBUG", 20, 20);
            let debugRoom = new RectangularRoom(0, 0, 20, 20, "DEBUG");
            debugRoom = this._createRoom(debugGameMap, debugRoom);
            const center = debugRoom.center();

            // add test lights
            debugGameMap.locations[debugRoom.x1 + 1][debugRoom.y1 + 1].addTile(Tiles.redTorch(debugRoom.x1 + 1, debugRoom.y1 + 1));
            debugGameMap.locations[debugRoom.x2 - 1][debugRoom.y1 + 1].addTile(Tiles.yellowTorch(debugRoom.x2 - 1, debugRoom.y1 + 1));
            debugGameMap.locations[debugRoom.x1 + 3][debugRoom.y2 - 1].addTile(Tiles.blueTorch(debugRoom.x1 + 3, debugRoom.y2 - 1));

            new EntityFactories.resurrectionInjector(center.x, center.y).place(debugGameMap);

            debugGameMap.locations[center.x - 1][center.y].addTile(Tiles.stairsDown(center.x - 1, center.y, "DEBUG-DOWN"));
            debugGameMap.locations[center.x + 1][center.y].addTile(Tiles.stairsUp(center.x + 1, center.y, "DEBUG-UP"));

            const debugGameMapDown = new GameMap(this.engineRef, "DEBUG-DOWN", 20, 20, []);
            const debugRoomDown = new RectangularRoom(6, 6, 6, 6, "DEBUG");
            this._createRoom(debugGameMapDown, debugRoomDown);
            debugGameMapDown.locations[center.x - 1][center.y].addTile(Tiles.stairsUp(center.x - 1, center.y, "DEBUG"));

            const debugGameMapUp = new GameMap(this.engineRef, "DEBUG-UP", 20, 20, []);
            const debugRoomUp = new RectangularRoom(0, 0, 15, 15, "DEBUG");
            this._createRoom(debugGameMapUp, debugRoomUp);
            debugGameMapUp.locations[center.x + 1][center.y].addTile(Tiles.stairsDown(center.x + 1, center.y, "DEBUG"));

            for (let i = 1; i < 14; i++) {
                new EntityFactories.targetDummy(i, 1).place(debugGameMapUp);
            }

            new EntityFactories.grenade(1, 10).place(debugGameMapUp);
            new EntityFactories.grenade(1, 11).place(debugGameMapUp);

            new EntityFactories.laserCharge(3, 10).place(debugGameMapUp);
            new EntityFactories.laserCharge(3, 11).place(debugGameMapUp);

            new EntityFactories.confuseRay(5, 10).place(debugGameMapUp);
            new EntityFactories.confuseRay(5, 11).place(debugGameMapUp);

            new EntityFactories.medkit(7, 10).place(debugGameMapUp);
            new EntityFactories.medkit(7, 11).place(debugGameMapUp);

            this.engineRef.addGameMap(debugGameMapDown);
            this.engineRef.addGameMap(debugGameMapUp);

            return this.engineRef.addGameMap(debugGameMap);
        }

        return this.engineRef.getGameMap("DEBUG");
    }

    _doesThisIntersectWithOtherRooms(roomToCheck) {
        for (let j = 0; j < this.rooms.length; j++) {
            const otherRoom = this.rooms[j];
            if(roomToCheck.intersects(otherRoom)) {
                return true;
            }
        }
        return false;
    }

    _createRoom(gameMap, newRoom) {
        // Create Room in map
        for (let x = newRoom.x1; x <= newRoom.x2; x++) {
            for (let y = newRoom.y1; y <= newRoom.y2; y++) {
                if (x === newRoom.x1 || x === newRoom.x2 || y === newRoom.y1 || y === newRoom.y2) {
                    if (gameMap.locations[x][y].tiles.length === 0) {
                        gameMap.locations[x][y].addTile(Tiles.wall(x, y));
                        gameMap.locations[x][y].addTile(Tiles.darkFloor(x, y));
                    }
                } else {
                    gameMap.locations[x][y].clearTiles();
                    gameMap.locations[x][y].addTile(Tiles.lightFloor(x, y));
                }
            }
        }

        for (let x = newRoom.x1; x <= newRoom.x2; x++) {
            for (let y = newRoom.y1; y <= newRoom.y2; y++) {
                if (x === newRoom.x1 || x === newRoom.x2 || y === newRoom.y1 || y === newRoom.y2) {
                    if (gameMap.locations[x][y].isTileWalkable()) {
                        if ((gameMap.locations[x-1][y].isTileAtDepth(RenderOrder.WALL) && gameMap.locations[x+1][y].isTileAtDepth(RenderOrder.WALL))
                         || (gameMap.locations[x][y-1].isTileAtDepth(RenderOrder.WALL) && gameMap.locations[x][y+1].isTileAtDepth(RenderOrder.WALL))) {
                            console.log("Created door on edge of room at " + x + "," + y);
                            gameMap.locations[x][y].addTile(Tiles.greenDoor(x, y));
                        }
                    }
                }
            }
        }

        console.log("Created room: " + newRoom);
        return newRoom;
    }

    // Sets the player coordinates based on the first room.
    setPlayerCoordinates(players) {
        const firstRoomCenter = this.rooms[0].center();
        for (let j = 0; j < players.length; j++) {
            const player = players[j];
            player.place(this.gameMap, firstRoomCenter.x + j, firstRoomCenter.y);
        }
        return players;
    }

    placeEntitiesInRoom(rectangularRoom) {
        const numMonstersToSpawn = Srand.intInRange(0, this.shipOptions.maxMonstersPerRoom);
        console.log("Spawning " + numMonstersToSpawn + " enemies in room: " + rectangularRoom);

        for (let i = 0; i < numMonstersToSpawn; i++) {
            const x = Srand.intInRange(rectangularRoom.x1 + 1, rectangularRoom.x2 - 1);
            const y = Srand.intInRange(rectangularRoom.y1 + 1, rectangularRoom.y2 - 1);

            const entity = this.gameMap.getBlockingEntityAtLocation(x, y);
            if (!entity) {
                const random = Srand.random();

                if (random < 0.7) {
                    new EntityFactories.attackDog(x, y).place(this.gameMap);
                } else if (random < 0.95) {
                    new EntityFactories.spacePirate(x, y).place(this.gameMap);
                } else {
                    new EntityFactories.automatedTurret(x, y).place(this.gameMap);
                }
            }
        }

        const numItemsToSpawn = Srand.intInRange(0, this.shipOptions.maxItemsPerRoom);
        console.log("Spawning " + numItemsToSpawn + " items in room: " + rectangularRoom);

        for (let i = 0; i < numItemsToSpawn; i++) {
            const x = Srand.intInRange(rectangularRoom.x1 + 1, rectangularRoom.x2 - 1);
            const y = Srand.intInRange(rectangularRoom.y1 + 1, rectangularRoom.y2 - 1);

            const entity = this.gameMap.getBlockingEntityAtLocation(x, y);
            if (!entity) {
                const itemChance = Srand.random();

                if (itemChance < 0.6) {
                    new EntityFactories.medkit(x, y).place(this.gameMap);
                } else if (itemChance < 0.73) {
                    new EntityFactories.grenade(x, y).place(this.gameMap);
                } else if (itemChance < 0.86) {
                    new EntityFactories.confuseRay(x, y).place(this.gameMap);
                } else if (itemChance < 0.99) {
                    new EntityFactories.laserCharge(x, y).place(this.gameMap);
                } else {
                    new EntityFactories.resurrectionInjector(x, y).place(this.gameMap);
                }
            }
        }
    }
}