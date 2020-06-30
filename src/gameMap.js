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

        this.floorTiles = create2dArray(this.rows);
        this.wallTiles = create2dArray(this.rows);
    }

    createTestMap() {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var color;
                if (i == 0 || i == this.rows - 1 || j == 0 || j == this.cols - 1) {
                    color = "333333";
                } else {
                    color = "999999";
                }
                var sprite = new Sprite("floor", color);
                this.floorTiles[i][j] = new Tile(i, j, "floor", sprite, true, true);
            }
        }

        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                if (i == 0 || i == this.rows - 1 || j == 0 || j == this.cols - 1) {
                    var sprite = new Sprite("wall", "666666");
                    this.wallTiles[i][j] = new Tile(i, j, "wall", sprite, false, false);
                }
            }
        }
    }
}