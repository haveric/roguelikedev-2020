export default class Tilemaps {}

Tilemaps.getTileMap = () => {
    var tilemap = {
        name: "tilemap",
        frameWidth: 24,
        frameHeight: 24,
        tiles: {
            "shroud": 219,
            "player": 64,
            "wall": 35,
            "floor": 219,
            "spacePirate": 80,
            "attackDog": 100,
            "automatedTurret": 84,
            "torch": 105,
            "door": 68,
            "doorOpen": 92,
            "corpse": 37,
            "medkit": 43
        }
    }

    return tilemap;
}