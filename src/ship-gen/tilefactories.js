import LightSource from "../components/lightSource";
import Openable from "../components/openable";
import Stairs from "../components/interactable/stairs";
import Embark from "../components/interactable/embark";
import Tile from "../entity/tile";
import Sprite from "../sprite";
import RenderOrder from "../utils/renderOrder";
import TeleportToShip from "../components/interactable/teleportToShip";

export default class Tiles { }

Tiles.darkFloor = (x, y) => new Tile(x, y, "Floor", "It looks like a floor. Nothing special about it.", new Sprite("floor", "333333"), true, false, RenderOrder.FLOOR);
Tiles.lightFloor = (x, y) =>  new Tile(x, y, "Floor", "It looks like a floor. Nothing special about it.", new Sprite("floor", "999999"), true, false, RenderOrder.FLOOR);
Tiles.wall = (x, y) => new Tile(x, y, "Wall", "It's a wall. Likely in your way", new Sprite("wall"), false, true, RenderOrder.WALL);

Tiles.torch = (x, y) => {
    const tile = new Tile(x, y, "Standing Torch", "Lights up an area.", new Sprite("torch", "ffa500"), false, false, RenderOrder.WALL);
    tile.lightSource = new LightSource("ffa500", 3, ".2");
    return tile;
};

Tiles.redTorch = (x, y) => {
    const tile = new Tile(x, y, "Standing Torch (Red)", "Lights up an area.", new Sprite("torch", "ff0000"), false, false, RenderOrder.WALL);
    tile.lightSource = new LightSource("ff0000", 4, ".2");
    return tile;
};

Tiles.yellowTorch = (x, y) => {
    const tile = new Tile(x, y, "Standing Torch (Yellow)", "Lights up an area.", new Sprite("torch", "ffff00"), false, false, RenderOrder.WALL);
    tile.lightSource = new LightSource("ffff00", 4, ".2");
    return tile;
};

Tiles.blueTorch = (x, y) => {
    const tile = new Tile(x, y, "Standing Torch (Blue)", "Lights up an area.", new Sprite("torch", "0000ff"), false, false, RenderOrder.WALL);
    tile.lightSource = new LightSource("0000ff", 3, ".2");
    return tile;
};

Tiles.greenDoor = (x, y) => {
    const tile = new Tile(x, y, "Door", "Typical door that opens and closes.", new Sprite("door"), false, true, RenderOrder.WALL);
    tile.openable = new Openable(tile, false, "door", "doorOpen");
    return tile;
};

Tiles.stairsDown = (x, y, level) => {
    const tile = new Tile(x, y, "Stairs (Down)", "There must be something below.", new Sprite("stairsDown"), true, false, RenderOrder.WALL);
    tile.interactable = new Stairs(tile, level);
    return tile;
};

Tiles.stairsUp = (x, y, level) => {
    const tile = new Tile(x, y, "Stairs (Up)", "There must be something above.", new Sprite("stairsUp"), true, false, RenderOrder.WALL);
    tile.interactable = new Stairs(tile, level);
    return tile;
};

Tiles.embarkTile = (x, y) => {
    const tile = new Tile(x, y, "Embark", "You can embark to other ships from here.", new Sprite("floor", "66ee66"), true, false, RenderOrder.WALL);
    tile.interactable = new Embark(tile);
    return tile;
};

Tiles.leaveShip = (x, y) => {
    const tile = new Tile(x, y, "Leave Ship", "Return to your ship.", new Sprite("floor", "6666ee"), true, false, RenderOrder.WALL);
    tile.interactable = new TeleportToShip(tile, "player");
    return tile;
};

Tiles.teleporterDebugRoom = (x, y) => {
    const tile = new Tile(x, y, "Enter Debug Room", "Enter here to debug the world.", new Sprite("floor", "ee6666"), true, false, RenderOrder.WALL);
    tile.interactable = new TeleportToShip(tile, "DEBUG");
    return tile;
};

