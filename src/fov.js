export function computeFovSimple(gameMap, exploredTiles, x, y, radius) {
    var minX = Math.max(0, x - radius);
    var maxX = Math.min(gameMap.width, x + radius);
    var minY = Math.max(0, y - radius);
    var maxY = Math.min(gameMap.height, y + radius);

    for (var i = minX; i < maxX; i++) {
        for (var j = minY; j < maxY; j++) {
            // Skip already explored tiles from other players
            if (!gameMap.shroud[i][j].visible) {
                gameMap.shroud[i][j].explore();
                exploredTiles.push(gameMap.shroud[i][j]);
            }
        }
    }
}