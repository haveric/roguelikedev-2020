import Srand from "seeded-rand";
import Tiles from "./tilefactories";

export class RoomTunneler {
    constructor(gameMap, rooms, room1, room2) {
        this.gameMap = gameMap;
        this.rooms = rooms;
        this.room1 = room1;
        this.room2 = room2;
    }

    tunnelBetweenRooms() {
        const lastRoomCenter = this.room1.center();
        const newRoomCenter = this.room2.center();
        this._tunnelBetween(lastRoomCenter.x, lastRoomCenter.y, newRoomCenter.x, newRoomCenter.y);
    }

    _tunnelBetween(x1, y1, x2, y2) {
        console.log("=== Start Tunnel (" + x1 + "," + y1 +")->(" + x2 + "," + y2 + ")");
        let doorData = {
            roomsEntered: [],
            lastX: -1,
            lastY: -1
        };

        doorData.roomsEntered.push(this.room1);
        if (Srand.intInRange(0, 1) === 1) {
            // horizontal first, then vertical
            doorData = this._createTunnel(x1, x2, y1, true, doorData);
            this._createTunnel(y1, y2, x2, false, doorData);
        } else {
            // vertical first, then horizontal
            doorData = this._createTunnel(y1, y2, x1, false, doorData);
            this._createTunnel(x1, x2, y2, true, doorData);
        }

        console.log("=== End Tunnel");
    }

    _createTunnel(axisStart, axisEnd, otherAxis, isHorizontal, doorData) {
        console.log(isHorizontal ? "  Horizontal" : "  Vertical");
        let direction = 1;
        if (axisEnd < axisStart) {
            direction = -1;
        }

        for (let axisCoord = axisStart; axisCoord !== axisEnd + direction; axisCoord += direction) {
            const x = isHorizontal ? axisCoord : otherAxis;
            const y = isHorizontal ? otherAxis : axisCoord;

            this.gameMap.locations[x][y].clearTiles(); // remove any wall

            if (doorData.lastX !== -1 && doorData.lastY !== -1) {
                for (let i = 0; i < doorData.roomsEntered.length; i++) {
                    const room = doorData.roomsEntered[i];

                    if (!room.intersectsPoint(x,y)) {
                        doorData.roomsEntered.splice(i, 1);
                        console.log("  Created door leaving room at " + doorData.lastX + "," + doorData.lastY);
                        this.gameMap.locations[doorData.lastX][doorData.lastY].addTile(Tiles.greenDoor(doorData.lastX, doorData.lastY));
                    }
                }
                for (let i = 0; i < this.rooms.length; i++) {
                    const room = this.rooms[i];
                    if (room.intersectsPoint(x,y)) {
                        if (!doorData.roomsEntered.includes(room)) {
                            doorData.roomsEntered.push(room);
                            if (room.isOnEdge(x,y)) {
                                console.log("  Created door entering room at " + x + "," + y);
                                this.gameMap.locations[x][y].addTile(Tiles.greenDoor(x, y));
                            }
                            break;
                        }
                    }
                }
            }

            this.gameMap.locations[x][y].addTile(Tiles.lightFloor(x, y));

            const xCheckTile1 = isHorizontal ? x : x - 1;
            const yCheckTile1 = isHorizontal ? y - 1 : y;
            this._tunnelAdjacent(xCheckTile1, yCheckTile1);

            const xCheckTile2 = isHorizontal ? x : x + 1;
            const yCheckTile2 = isHorizontal ? y + 1 : y;
            this._tunnelAdjacent(xCheckTile2, yCheckTile2);

            doorData.lastX = x;
            doorData.lastY = y;
        }

        return doorData;
    }

    _tunnelAdjacent(x, y) {
        // do not place a wall if there is already a tile here
        if (this.gameMap.locations[x][y].tiles.length === 0) {
            this.gameMap.locations[x][y].addTile(Tiles.wall(x, y));
            this.gameMap.locations[x][y].addTile(Tiles.darkFloor(x, y));
        }
    }
}
