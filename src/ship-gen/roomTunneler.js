import Srand from 'seeded-rand';
import Tiles from './tilefactories';

export class RoomTunneler {

    constructor(gameMap, room1, room2) {
        this.gameMap = gameMap;
        this.room1 = room1;
        this.room2 = room2;
    }

    tunnelBetweenRooms() {
        var lastRoomCenter = this.room1.center();
        var newRoomCenter = this.room2.center();
        this._tunnelBetween(lastRoomCenter.x, lastRoomCenter.y, newRoomCenter.x, newRoomCenter.y);
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

            this.gameMap.locations[x][y].clearTiles(); // remove any wall
            if (this.room1.isOnEdge(x, y) || this.room2.isOnEdge(x, y)) {
                console.log('Created door at ' + x + ',' + y)
                this.gameMap.locations[x][y].addTile(Tiles.greenDoor(x, y));
            }
            this.gameMap.locations[x][y].addTile(Tiles.lightFloor(x, y));
            
    
            var xCheckTile1 = isHorizontal ? x : x - 1;
            var yCheckTile1 = isHorizontal ? y - 1 : y;
            this._tunnelAdjacent(xCheckTile1, yCheckTile1);
    
            var xCheckTile2 = isHorizontal ? x : x + 1;
            var yCheckTile2 = isHorizontal ? y + 1 : y;
            this._tunnelAdjacent(xCheckTile2, yCheckTile2);
        }
    }

    _tunnelAdjacent(x, y) {
        // do not place a wall if there is already a tile here
        if (this.gameMap.locations[x][y].tiles.length == 0) {
            this.gameMap.locations[x][y].addTile(Tiles.wall(x, y));
            this.gameMap.locations[x][y].addTile(Tiles.darkFloor(x, y));
        }
    }
}
