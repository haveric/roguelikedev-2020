const create2dArray = (rows) => {
    const array = [];

    for (let i = 0; i < rows; i++) {
        array[i] = [];
    }

    return array;
};

const getSpriteDetails = (tilemap, spriteName, color) => {
    let spriteDetails;
    if (tilemap.tiles[spriteName]) {
        spriteDetails = tilemap.tiles[spriteName];
    } else if (tilemap.tiles["unknown"]) {
        spriteDetails = tilemap.tiles["unknown"];
        console.log("Tilemap '" + tilemap.name + "' missing sprite: " + spriteName);
    } else {
        console.log("Tilemap '" + tilemap.name + "' missing default 'unknown' sprite");
    }

    if (typeof spriteDetails === "number") {
        // Move shorthand to full format
        spriteDetails = {
            frame: spriteDetails,
            color: "ffffff"
        };
    } else if (spriteDetails.frame === undefined) {
        if (tilemap.tiles["unknown"]) {
            spriteDetails.frame = tilemap.tiles["unknown"].frame || tilemap.tiles["unknown"];
            console.log("Tilemap '" + tilemap.name + "' missing frame for sprite: " + spriteName);
        } else {
            console.log("Tilemap '" + tilemap.name + "' missing default 'unknown' sprite");
        }
    }

    if (color !== undefined) {
        spriteDetails.color = color;
    }

    return spriteDetails;
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
exports.getSpriteDetails = getSpriteDetails;
exports.hexToRgb = hexToRgb;