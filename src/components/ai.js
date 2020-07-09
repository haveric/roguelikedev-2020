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
        var gameMap = this.entityRef.gameMap;
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

        var start = costGraph.grid[this.entityRef.x][this.entityRef.y];
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
        var closestDistance;
        for (var i = 0; i < players.length; i++) {
            var target = players[i];
            var dx = target.x - this.entityRef.x;
            var dy = target.y - this.entityRef.y;

            var distance = Math.max(Math.abs(dx), Math.abs(dy));
            if (!closestDistance || distance < closestDistance || (distance == closestDistance && Srand.intInRange(0,1) == 0)) {
                closestPlayer = target;
                closestDistance = distance;
            }
        }

        if (this.getEngine().gameMap.shroud[this.entityRef.x][this.entityRef.y].visible) {
            if (distance <= 1) {
                return new MeleeAction(this.entityRef, closestPlayer.x - this.entityRef.x, closestPlayer.y - this.entityRef.y).perform();
            }

            this.path = this.getPathTo(closestPlayer.x, closestPlayer.y);
        }

        if (this.path.length > 0) {
            var next = this.path.shift();

            return new MovementAction(this.entityRef, next.x - this.entityRef.x, next.y - this.entityRef.y).perform();
        }

        return new WaitAction(this.entityRef).perform();
    }
}