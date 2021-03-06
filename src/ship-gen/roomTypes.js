import Srand from "seeded-rand";
import { create2dArray } from "../utils/utils";

export class RectangularRoom {
    constructor(x, y, width, height, name) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + width - 1;
        this.y2 = y + height - 1;
        this.name = name;

        this.tiles = create2dArray(width);
    }

    center() {
        const centerX = Math.floor((this.x1 + this.x2) / 2);
        const centerY = Math.floor((this.y1 + this.y2) / 2);

        return { x: centerX, y: centerY };
    }

    intersects(rectangularRoom) {
        return this.x1 <= rectangularRoom.x2
            && this.x2 >= rectangularRoom.x1
            && this.y1 <= rectangularRoom.y2
            && this.y2 >= rectangularRoom.y1;
    }

    isOnEdge(x, y) {
        return (y >= this.y1 && y <= this.y2 && (x === this.x1 || x === this.x2))
            || (x >= this.x1 && x <= this.x2 && (y === this.y1 || y === this.y2));
    }

    isInside(x, y) {
        return this.x1 < x
            && this.x2 > x
            && this.y1 < y
            && this.y2 > y;
    }

    intersectsPoint(x, y) {
        return this.x1 <= x
            && this.x2 >= x
            && this.y1 <= y
            && this.y2 >= y;
    }

    /**
     * @returns {{x: integer, y: integer}} coordinates
     */
    getRandomXYInRoom() {
        const x = Srand.intInRange(this.x1 + 1, this.x2 - 1);
        const y = Srand.intInRange(this.y1 + 1, this.y2 - 1);
        return {x: x, y: y};
    }

    toString() {
        return (this.name || "unnamed") + " { x1: " + this.x1
            + ", y1: " + this.y1
            + ", x2: " + this.x2
            + ", y2: " + this.y2 + " }";
    }
}

export const RoomConstants = {
    holdWidth: 14,
    holdHeight: 10,
    baseBreachWidth: 5,
    baseBreachHeight: 7,
    bridgeWidth: 6,
    bridgeHeight: 10
};

export class RoomTypeFactories { }

RoomTypeFactories.createHold = (x, y) => {
    if(Srand.choice([true, false])) {
        return new RectangularRoom(x, y, RoomConstants.holdWidth, RoomConstants.holdHeight, "Hold");
    } else {
        return new RectangularRoom(x, y, RoomConstants.holdHeight, RoomConstants.holdWidth, "Hold");
    }
};

export class Hold extends RectangularRoom {
    constructor(x, y) {
        super(x, y, RoomConstants.holdWidth, RoomConstants.holdHeight, "Hold");
    }
}

export class BreachRoom extends RectangularRoom {
    constructor(x, y) {
        super(x, y, RoomConstants.baseBreachWidth, RoomConstants.baseBreachHeight, "Breach Room");
    }
}

export class Bridge extends RectangularRoom {
    constructor(x, y) {
        super(x, y, RoomConstants.bridgeWidth, RoomConstants.bridgeHeight, "Bridge");
    }
}
