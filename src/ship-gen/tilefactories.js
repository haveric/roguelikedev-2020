import LightSource from "../components/lightSource";
import Openable from "../components/openable";
import Tile from "../tile";
import Sprite from "../sprite";
import RenderOrder from "../renderOrder";

export default class Tiles { }

Tiles.darkFloor = (x, y) => new Tile(x, y, "Floor", "It looks like a floor. Nothing special about it.", new Sprite("floor", "333333"), true, false, RenderOrder.FLOOR);
Tiles.lightFloor = (x, y) =>  new Tile(x, y, "Floor", "It looks like a floor. Nothing special about it.", new Sprite("floor", "999999"), true, false, RenderOrder.FLOOR);
Tiles.wall = (x, y) => new Tile(x, y, "Wall", "It's a wall. Likely in your way", new Sprite("wall", "666666"), false, true, RenderOrder.WALL);

Tiles.torch = (x, y) => {
    var tile = new Tile(x, y, "Standing Torch", "Lights up an area.", new Sprite("torch", "ffa500"), false, false, RenderOrder.WALL);
    tile.lightSource = new LightSource("ffa500", 3, ".2");
    return tile;
}

Tiles.redTorch = (x, y) => {
    var tile = new Tile(x, y, "Standing Torch (Red)", "Lights up an area.", new Sprite("torch", "ff0000"), false, false, RenderOrder.WALL);
    tile.lightSource = new LightSource("ff0000", 4, ".2");
    return tile;
}

Tiles.yellowTorch = (x, y) => {
    var tile = new Tile(x, y, "Standing Torch (Yellow)", "Lights up an area.", new Sprite("torch", "ffff00"), false, false, RenderOrder.WALL);
    tile.lightSource = new LightSource("ffff00", 4, ".2");
    return tile;
}

Tiles.blueTorch = (x, y) => {
    var tile = new Tile(x, y, "Standing Torch (Blue)", "Lights up an area.", new Sprite("torch", "0000ff"), false, false, RenderOrder.WALL);
    tile.lightSource = new LightSource("0000ff", 3, ".2");
    return tile;
}

Tiles.greenDoor = (x, y) => {
    var tile = new Tile(x, y, "Door", "Typical door that opens and closes.", new Sprite("door", "009933"), false, true, RenderOrder.WALL);
    tile.openable = new Openable(tile, false, "door", "doorOpen");
    return tile;
}
