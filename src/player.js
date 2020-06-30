import Entity from './entity.js';

export default class Player extends Entity {
    constructor(socketId, x, y, name, sprite, energy, energyMax) {
        super(x, y, name, sprite);

        this.playerId = socketId;
        this.energy = energy;
        this.energyMax = energyMax;
    }
}