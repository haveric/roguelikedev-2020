import { astar, Graph } from 'javascript-astar';
import Srand from 'seeded-rand';
import { create2dArray } from '../../utils';
import { Actor } from '../entity';
import { MeleeAction, MovementAction, WaitAction } from '../actions';
import BaseComponent from './baseComponent';

export class BaseAI extends BaseComponent {
    constructor(entity) {
        super(entity);
    }

    perform() {}

    getPathTo(destX, destY) {
        var gameMap = this.getGameMap();
        var locations = gameMap.locations;

        var cost = Array(gameMap.width).fill().map(() => Array(gameMap.height).fill(0));

        for (var i = 0; i < gameMap.width; i++) {
            for (var j = 0; j < gameMap.height; j++) {
                var location = locations[i][j];
                if (location.isTileWalkable()) {
                    cost[i][j] = 1;
                }
            }
        }

        var entities = gameMap.entities;
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            if (entity.blocksMovement && cost[entity.x][entity.y]) {
                cost[entity.x][entity.y] += 10;
            }
        }

        var costGraph = new Graph(cost, { diagonal: true });

        var start = costGraph.grid[this.parent.x][this.parent.y];
        var end = costGraph.grid[destX][destY];
        var result = astar.search(costGraph, start, end);

        return result;
    }
}

export class HostileEnemy extends BaseAI {
    constructor(entity) {
        super(entity);
        this.path = [];
    }

    perform() {
        var players = this.getEngine().players;

        var closestPlayer;
        var closestDistance = null;
        for (var i = 0; i < players.length; i++) {
            var target = players[i];
            if (target.isAlive()) {
                var dx = target.x - this.parent.x;
                var dy = target.y - this.parent.y;

                var distance = Math.max(Math.abs(dx), Math.abs(dy));
                if (closestDistance == null || distance < closestDistance || (distance == closestDistance && Srand.intInRange(0,1) == 0)) {
                    closestPlayer = target;
                    closestDistance = distance;
                }
            }
        }

        // Only take action if a player exists
        if (closestPlayer) {
            if (this.getGameMap().shroud[this.parent.x][this.parent.y].visible) {
                if (closestDistance <= 1) {
                    return new MeleeAction(this.parent, closestPlayer.x - this.parent.x, closestPlayer.y - this.parent.y).perform(true);
                }

                this.path = this.getPathTo(closestPlayer.x, closestPlayer.y);
            }

            if (this.path.length > 0) {
                var next = this.path.shift();

                return new MovementAction(this.parent, next.x - this.parent.x, next.y - this.parent.y).perform(true);
            }
        }

        return new WaitAction(this.parent).perform(true);
    }
}