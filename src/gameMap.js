import { create2dArray } from '../utils.js';
import Sprite from './sprite.js';
import Tile from './tile.js';

export default class GameMap {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;

        // Offsets to center the map on screen
        this.offsetWidth = 400;
        this.offsetHeight = 300;

        this.tiles = create2dArray(this.rows);
    }

    createTestMap() {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                if (i == 0 || i == this.rows - 1 || j == 0 || j == this.cols - 1) {
                    var sprite = new Sprite("floor", "#", "666666", "█", "333333");
                    this.tiles[i][j] = new Tile(i, j, "floor", sprite, false, false);
                } else {
                    var sprite = new Sprite("wall", null, null, "█", "999999");
                    this.tiles[i][j] = new Tile(i, j, "wall", sprite, true, true);
                }
            }
        }
    }
}