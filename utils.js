const create2dArray = (rows) => {
    var array = [];

    for (var i = 0; i < rows; i++) {
        array[i] = [];
    }

    return array;
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getFrameOf = (scene, sprite, iconFallback, bgIcon) => {
    var frame = null;
    var bgFrame = null;
    var drawBackground = true;
    if (scene.tilemap.tiles[sprite]) {
        frame = scene.tilemap.tiles[sprite];
        drawBackground = false;
    } else if (scene.tilemap.tiles[iconFallback]) {
        frame = scene.tilemap.tiles[iconFallback];
    }

    if (drawBackground && scene.tilemap.tiles[bgIcon]) {
        bgFrame = scene.tilemap.tiles[bgIcon];
    }

    if (frame == null && bgFrame == null) {
        console.log("Tilemap missing sprites! " + sprite + ", " + iconFallback + ", " + bgIcon);
    }

    return {frame: frame, bgFrame: bgFrame };
};

const hexToRgb = (hex) => {
    var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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