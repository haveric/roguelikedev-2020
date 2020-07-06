import Entity from './entity';
import RenderOrder from './renderOrder';

export default class Player extends Entity {
    constructor(socketId, x, y, name, sprite, blocksMovement, energy, energyMax) {
        super(x, y, name, sprite, blocksMovement, RenderOrder.ACTOR);

        this.playerId = socketId;
        this.energy = energy;
        this.energyMax = energyMax;
        this.hasSharedVision = true;
    }
}