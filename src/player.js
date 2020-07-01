import Entity from './entity.js';

export default class Player extends Entity {
    constructor(socketId, x, y, name, sprite, blocksMovement, energy, energyMax) {
        super(x, y, name, sprite, blocksMovement);

        this.playerId = socketId;
        this.energy = energy;
        this.energyMax = energyMax;
        this.hasSharedVision = true;
    }
}