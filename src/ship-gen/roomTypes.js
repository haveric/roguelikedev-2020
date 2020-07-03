import { create2dArray } from '../../utils.js';
import Srand from 'seeded-rand';

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

    toString() {
        return 'Room: { x1: ' + this.x1 
            + ', y1: ' + this.y1
            + ', x2: ' + this.x2
            + ', y2: ' + this.y2 + ' }'
    }
}

export const RoomConstants = {
    holdWidth: 14,
    holdHeight: 10,
    baseBreachWidth: 5,
    baseBreachHeight: 7,
    bridgeWidth: 10,
    bridgeHeight: 6
}

export class RoomTypeFactories { }

RoomTypeFactories.createHold = (x, y) => {
    if(Srand.choice([true, false])) {
        return new RectangularRoom(x, y, RoomConstants.holdWidth, RoomConstants.holdHeight);
    } else {
        return new RectangularRoom(x, y, RoomConstants.holdHeight, RoomConstants.holdWidth);
    }
    
}
export class Hold extends RectangularRoom {
    constructor(x, y) {
        super(x, y, RoomConstants.holdWidth, RoomConstants.holdHeight)
    }
}

export class BreachRoom extends RectangularRoom {
    constructor(x, y) {
        super(x, y, RoomConstants.baseBreachWidth, RoomConstants.baseBreachHeight)
    }
}

export class Bridge extends RectangularRoom {
    constructor(x, y) {
        super(x, y, RoomConstants.bridgeWidth, RoomConstants.bridgeHeight);
    }
}