import Tile from "../tile";
import Sprite from "../sprite";


export default class Tiles { }

Tiles.darkFloor = (x, y) => new Tile(x, y, "floor", new Sprite("floor", "333333"), true, false);
Tiles.lightFloor = (x, y) =>  new Tile(x, y, "floor", new Sprite("floor", "999999"), true, false);
Tiles.wall = (x, y) => new Tile(x, y, "wall", new Sprite("wall", "666666"), false, true);