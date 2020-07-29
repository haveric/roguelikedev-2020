const create2dArray = (rows) => {
    const array = [];

    for (let i = 0; i < rows; i++) {
        array[i] = [];
    }

    return array;
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getFrameOf = (tilemap, sprite) => {
    let frame;
    if (tilemap.tiles[sprite]) {
        frame = tilemap.tiles[sprite];
    } else {
        frame = tilemap.tiles["unknown"];
        console.log("Tilemap missing sprites! " + sprite);
    }

    return frame;
};

const hexToRgb = (hex) => {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

exports.create2dArray = create2dArray;
exports.getRandomInt = getRandomInt;
exports.getFrameOf = getFrameOf;
exports.hexToRgb = hexToRgb;