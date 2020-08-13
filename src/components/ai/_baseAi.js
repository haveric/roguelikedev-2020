import BaseComponent from "../_baseComponent";
import {astar, Graph} from "javascript-astar";

export class BaseAI extends BaseComponent {
    constructor(entity) {
        super(entity);
    }

    perform() {}

    getPathTo(destX, destY) {
        const gameMap = this.getGameMap();
        const locations = gameMap.locations;

        const cost = Array(gameMap.width).fill().map(() => Array(gameMap.height).fill(0));

        for (let i = 0; i < gameMap.width; i++) {
            for (let j = 0; j < gameMap.height; j++) {
                const location = locations[i][j];
                if (location.isTileWalkable()) {
                    cost[i][j] = 1;
                }
            }
        }

        const entities = gameMap.entities;
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity.blocksMovement && cost[entity.x][entity.y]) {
                cost[entity.x][entity.y] += 10;
            }
        }

        const costGraph = new Graph(cost, { diagonal: true });

        const start = costGraph.grid[this.parent.x][this.parent.y];
        const end = costGraph.grid[destX][destY];

        return astar.search(costGraph, start, end);
    }
}