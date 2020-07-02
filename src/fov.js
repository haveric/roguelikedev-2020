class Slope {
    constructor(y, x) {
        this.y = y;
        this.x = x;
    }

    greater(y, x) {
        return this.y * x > this.x * y;
    }

    greaterOrEqual(y, x) {
        return this.y * x >= this.x * y;
    }

    less(y, x) {
        return this.y * x < this.x * y;
    }
}

export class Fov {}
Fov.exploreTile = (gameMap, x, y, exploredTiles)  => {
    // Skip already explored tiles from other players
    if (gameMap.shroud[x] && gameMap.shroud[x][y] && !gameMap.shroud[x][y].visible) {
        gameMap.shroud[x][y].explore();
        exploredTiles.push(gameMap.shroud[x][y]);
    }
}

Fov.blocksLight = (gameMap, x, y, octant, originX, originY)  => {
    switch(octant) {
        case 0:
            originX += x;
            originY -= y;
            break;
        case 1:
            originX += y;
            originY -= x;
            break;
        case 2:
            originX -= y;
            originY -= x;
            break;
        case 3:
            originX -= x;
            originY -= y;
            break;
        case 4:
            originX -= x;
            originY += y;
            break;
        case 5:
            originX -= y;
            originY += x;
            break;
        case 6:
            originX += y;
            originY += x;
            break;
        case 7:
            originX += x;
            originY += y;
            break;
    }

    var blocksLight = false;
    if (gameMap.wallTiles[originX]) {
        var wallTile = gameMap.wallTiles[originX][originY];
        if (wallTile && wallTile.blockFOV) {
            blocksLight = true;
        }
    }
    return blocksLight;
}

Fov.setVisible = (gameMap, exploredTiles, x, y, octant, originX, originY) => {
    switch(octant) {
        case 0:
            originX += x;
            originY -= y;
            break;
        case 1:
            originX += y;
            originY -= x;
            break;
        case 2:
            originX -= y;
            originY -= x;
            break;
        case 3:
            originX -= x;
            originY -= y;
            break;
        case 4:
            originX -= x;
            originY += y;
            break;
        case 5:
            originX -= y;
            originY += x;
            break;
        case 6:
            originX += y;
            originY += x;
            break;
        case 7:
            originX += x;
            originY += y;
            break;
    }

    Fov.exploreTile(gameMap, originX, originY, exploredTiles);
}

export class FovSimple {}
FovSimple.compute = (gameMap, exploredTiles, x, y, radius) => {
    var minX = Math.max(0, x - radius);
    var maxX = Math.min(gameMap.width, x + radius);
    var minY = Math.max(0, y - radius);
    var maxY = Math.min(gameMap.height, y + radius);

    for (var i = minX; i < maxX; i++) {
        for (var j = minY; j < maxY; j++) {
            Fov.exploreTile(gameMap, i, j, exploredTiles);
        }
    }
}

/**
* Credit to Adam Millazo: http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html
*/
export class FovAdamMillazo { }
FovAdamMillazo.compute = (gameMap, exploredTiles, x, y, radius) => {
    Fov.exploreTile(gameMap, x, y, exploredTiles);

    for (var octant = 0; octant < 8; octant++) {
        FovAdamMillazo.computeOctant(gameMap, exploredTiles, octant, 1, x, y, radius, new Slope(1, 1), new Slope(0, 1));
    }
}

FovAdamMillazo.computeOctant = (gameMap, exploredTiles, octant, x, originX, originY, radius, top, bottom) => {
    for (; x < radius; x++) {
        var topY;
        if (top.x == 1) {
            topY = x;
        } else {
            topY = Math.round(((x * 2 - 1) * top.y + top.x) / (top.x * 2));

            if (Fov.blocksLight(gameMap, x, topY, octant, originX, originY)) {
                if (top.greaterOrEqual(topY * 2 + 1, x * 2) && !Fov.blocksLight(gameMap, x, topY + 1, octant, originX, originY)) {
                    topY ++;
                }
            } else {
                var ax = x * 2;
                if (Fov.blocksLight(gameMap, x + 1, topY + 1, octant, originX, originY)) {
                    ax++;
                }

                if (top.greater(topY * 2 + 1, ax)) {
                    topY ++;
                }
            }
        }

        var bottomY;
        if (bottom.y == 0) {
            bottomY = 0;
        } else {
            bottomY = ((x * 2 - 1) * bottom.y + bottom.x) / (bottom.x * 2);

            if (bottom.greaterOrEqual(bottomY * 2 + 1, x * 2) && Fov.blocksLight(gameMap, x, bottomY, octant, originX, originY) && !this.blocksLight(gameMap, x, bottomY + 1, octant, originX, originY)) {
                bottomY ++;
            }
        }

        var wasOpaque = -1;
        for (var y = topY; y >= bottomY; y--) {
            var isOpaque = Fov.blocksLight(gameMap, x, y, octant, originX, originY);

            var isVisible = isOpaque || ((y != topY || top.greater(y * 4 - 1, x * 4 + 1)) && (y != bottomY || bottom.less(y * 4 + 1, x * 4 - 1)));

            if (isVisible) {
                Fov.setVisible(gameMap, exploredTiles, x, y, octant, originX, originY);

                if (x != radius) {
                    if (isOpaque) {
                        if (wasOpaque == 0) {
                            var nx = x *2;
                            var ny = y * 2 + 1;

                            if (Fov.blocksLight(gameMap, x, y + 1, octant, originX, originY)) {
                                nx --;
                            }

                            if (top.greater(ny, nx)) {
                                if (y == bottomY) {
                                    bottom = new Slope(ny, nx);
                                    break;
                                } else {
                                    FovAdamMillazo.computeOctant(gameMap, exploredTiles, octant, x + 1, originX, originY, top, new Slope(ny, nx));
                                }
                            } else {
                                if (y == bottomY) {
                                    return;
                                }
                            }
                        }

                        wasOpaque = 1;
                    } else {
                        if (wasOpaque > 0) {
                            var nx = x * 2;
                            var ny = y * 2 + 1;

                            if (Fov.blocksLight(gameMap, x + 1, y + 1, octant, originX, originY)) {
                                nx ++;
                            }

                            if (bottom.greaterOrEqual(ny, nx)) {
                                return;
                            }

                            top = new Slope(ny, nx);
                        }

                        wasOpaque = 0;
                    }
                }
            }
        }

        if (wasOpaque != 0) {
            break;
        }
    }
}

