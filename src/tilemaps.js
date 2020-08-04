export default class Tilemaps {}

Tilemaps.getTileMap = () => {
    return {
        name: "tilemap",
        frameWidth: 24,
        frameHeight: 24,
        tiles: {
            "unknown": 63,
            "shroud": 219,
            "highlight": 219,
            "player": 64,
            "wall": {
                frame: 35,
                color: "666666"
            },
            "floor": 219,
            "spacePirate": {
                frame: 80,
                color: "cc0000"
            },
            "attackDog": {
                frame: 100,
                color: "654321"
            },
            "automatedTurret": {
                frame: 84,
                color: "222222"
            },
            "torch": 105,
            "door": {
                frame: 68,
                color: "009933"
            },
            "doorOpen": {
                frame: 92,
                color: "009933"
            },
            "corpse": {
                frame: 37,
                color: "BF0000"
            },
            "medkit": {
                frame: 43,
                color: "7f00ff"
            },
            "laserCharge": {
                frame: 126,
                color: "ffff00"
            },
            "confuseRay": {
                frame: 126,
                color: "cf3fff"
            },
            "grenade": {
                frame: 235,
                color: "ff0000"
            },
            "stairsDown": {
                frame: 60,
                color: "eeeeee"
            },
            "stairsUp": {
                frame: 62,
                color: "eeeeee"
            },
            "targetDummy": {
                color: "654321"
            },
            "resurrectionInjector": {
                color: "00ee00"
            },
            "credits": {
                frame: 237,
                color: "000000"
            },
            "shield": {
                frame: 213,
                color: "0000cc"
            },
            "dust": {
                frame: 235,
                color: "ffc0cb"
            },
            "blaster": {
                frame: 182,
                color: "800080"
            }
        }
    };
};