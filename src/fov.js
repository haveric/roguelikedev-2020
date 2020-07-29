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
Fov.exploreTile = (gameMap, x, y, lightSource) => {
    if (gameMap.shroud[x] && gameMap.shroud[x][y]) {
        // Skip already explored tiles from other players
        if (!gameMap.shroud[x][y].visible) {
            gameMap.shroud[x][y].explore();

            if (gameMap.newExploredTiles) {
                gameMap.newExploredTiles.push(gameMap.shroud[x][y]);
            }

        }
        if (lightSource) {
            gameMap.shroud[x][y].addLightSource(lightSource);
        } else {
            const tiles = gameMap.locations[x][y].tiles;
            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i];
                if (tile.lightSource) {
                    gameMap.shroud[x][y].addLightSource(tile.lightSource);
                }
            }
        }
    }
};

Fov.exploreLight = (gameMap, x, y, exploreOctant, originX, originY) => {
    switch(exploreOctant) {
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

    if (gameMap.locations[originX] && gameMap.locations[originX][originY]) {
        const tiles = gameMap.locations[originX][originY].tiles;
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const lightSource = tile.lightSource;

            if (lightSource) {
                if (!gameMap.newLightSources.includes(lightSource)) {
                    gameMap.newLightSources.push(lightSource);

                    for (let octant = 0; octant < 8; octant ++) {
                        FovAdamMillazo.computeOctant(gameMap, octant, 1, originX, originY, lightSource.range, lightSource.range, new Slope(1, 1), new Slope(0, 1), lightSource);
                    }

                }
            }
        }
    }
};

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

    let blocksLight = false;
    if (gameMap.locations[originX]) {
        const location = gameMap.locations[originX][originY];
        if (location && location.isTileBlockingFOV()) {
            blocksLight = true;
        }
    }
    return blocksLight;
};

Fov.setVisible = (gameMap, x, y, octant, originX, originY, lightSource) => {
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

    Fov.exploreTile(gameMap, originX, originY, lightSource);
};

export class FovSimple {}
FovSimple.compute = (gameMap, x, y, radius) => {
    const minX = Math.max(0, x - radius);
    const maxX = Math.min(gameMap.width, x + radius);
    const minY = Math.max(0, y - radius);
    const maxY = Math.min(gameMap.height, y + radius);

    for (let i = minX; i < maxX; i++) {
        for (let j = minY; j < maxY; j++) {
            Fov.exploreTile(gameMap, i, j);
        }
    }
};

/**
* Credit to Adam Millazo: http://www.adammil.net/blog/v125_Roguelike_Vision_Algorithms.html
*/
export class FovAdamMillazo { }
FovAdamMillazo.compute = (gameMap, x, y, radius) => {
    Fov.exploreTile(gameMap, x, y);

    for (let octant = 0; octant < 8; octant++) {
        FovAdamMillazo.computeOctant(gameMap, octant, 1, x, y, radius, radius * 2, new Slope(1, 1), new Slope(0, 1));
    }
};

FovAdamMillazo.computeOctant = (gameMap, octant, x, originX, originY, radius, extendedRadius, top, bottom, lightSource) => {
    for (; x < extendedRadius; x++) {
        let topY;
        if (top.x === 1) {
            topY = x;
        } else {
            topY = Math.round(((x * 2 - 1) * top.y + top.x) / (top.x * 2));

            if (Fov.blocksLight(gameMap, x, topY, octant, originX, originY)) {
                if (top.greaterOrEqual(topY * 2 + 1, x * 2) && !Fov.blocksLight(gameMap, x, topY + 1, octant, originX, originY)) {
                    topY ++;
                }
            } else {
                let ax = x * 2;
                if (Fov.blocksLight(gameMap, x + 1, topY + 1, octant, originX, originY)) {
                    ax++;
                }

                if (top.greater(topY * 2 + 1, ax)) {
                    topY ++;
                }
            }
        }

        let bottomY;
        if (bottom.y === 0) {
            bottomY = 0;
        } else {
            bottomY = ((x * 2 - 1) * bottom.y + bottom.x) / (bottom.x * 2);

            if (bottom.greaterOrEqual(bottomY * 2 + 1, x * 2) && Fov.blocksLight(gameMap, x, bottomY, octant, originX, originY) && !this.blocksLight(gameMap, x, bottomY + 1, octant, originX, originY)) {
                bottomY ++;
            }
        }

        let wasOpaque = -1;
        for (let y = topY; y >= bottomY; y--) {
            const isOpaque = Fov.blocksLight(gameMap, x, y, octant, originX, originY);
            const isVisible = isOpaque || ((y !== topY || top.greater(y * 4 - 1, x * 4 + 1)) && (y !== bottomY || bottom.less(y * 4 + 1, x * 4 - 1)));

            if (isVisible) {
                Fov.exploreLight(gameMap, x, y, octant, originX, originY);
            }

            if (radius < 0 || Math.max(Math.abs(x), Math.abs(y)) <= radius) {
                if (isVisible) {
                    Fov.setVisible(gameMap, x, y, octant, originX, originY, lightSource);

                    if (x !== radius) {
                        if (isOpaque) {
                            if (wasOpaque === 0) {
                                let nx = x *2;
                                const ny = y * 2 + 1;

                                if (Fov.blocksLight(gameMap, x, y + 1, octant, originX, originY)) {
                                    nx --;
                                }

                                if (top.greater(ny, nx)) {
                                    if (y === bottomY) {
                                        bottom = new Slope(ny, nx);
                                        break;
                                    } else {
                                        FovAdamMillazo.computeOctant(gameMap, octant, x + 1, originX, originY, radius, extendedRadius, top, new Slope(ny, nx), lightSource);
                                    }
                                } else {
                                    if (y === bottomY) {
                                        return;
                                    }
                                }
                            }

                            wasOpaque = 1;
                        } else {
                            if (wasOpaque > 0) {
                                let nx = x * 2;
                                const ny = y * 2 + 1;

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
        }

        if (wasOpaque !== 0) {
            break;
        }
    }
};

