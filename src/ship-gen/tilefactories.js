import Tile from "../tile";
import LightSource from "../components/lightSource";
import Openable from "../components/openable";
import Sprite from "../sprite";


export default class Tiles { }

Tiles.darkFloor = (x, y) => new Tile(x, y, "floor", new Sprite("floor", "333333"), true, false);
Tiles.lightFloor = (x, y) =>  new Tile(x, y, "floor", new Sprite("floor", "999999"), true, false);
Tiles.wall = (x, y) => new Tile(x, y, "wall", new Sprite("wall", "666666"), false, true);

Tiles.torch = (x, y) => {
    var tile = new Tile(x, y, "torch", new Sprite("torch", "ffa500"), false, false);
    tile.lightSource = new LightSource("ffa500", 3, ".2");
    return tile;
}

Tiles.redTorch = (x, y) => {
    var tile = new Tile(x, y, "torch", new Sprite("torch", "ff0000"), false, false);
    tile.lightSource = new LightSource("ff0000", 4, ".2");
    return tile;
}

Tiles.yellowTorch = (x, y) => {
    var tile = new Tile(x, y, "torch", new Sprite("torch", "ffff00"), false, false);
    tile.lightSource = new LightSource("ffff00", 4, ".2");
    return tile;
}

Tiles.greenDoor = (x, y) => {
    var tile = new Tile(x, y, "door", new Sprite("door", "009933"), false, true);
    tile.openable = new Openable(tile, false, "door", "doorOpen");
    return tile;
}
