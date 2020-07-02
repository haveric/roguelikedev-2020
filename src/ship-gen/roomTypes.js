import { create2dArray } from '../../utils.js';

export const RoomConstants = {
    baseHoldWidth: 10,
    baseHoldHeight: 6,
    baseBreachWidth: 3,
    baseBreachHeight: 5
}

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

export class Hold extends RectangularRoom {
    constructor(x, y) {
        super(x, y, RoomConstants.baseHoldWidth, RoomConstants.baseHoldHeight)
    }
}

export class BreachRoom extends RectangularRoom {
    constructor(x, y) {
        super(x, y, RoomConstants.baseBreachWidth, RoomConstants.baseBreachHeight)
    }
}