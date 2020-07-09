import { Actor } from './entity';
import RenderOrder from './renderOrder';

export default class Player extends Actor {
    constructor(socketId, x, y, name, sprite, energy, energyMax) {
        super(x, y, name, sprite);

        this.playerId = socketId;
        this.energy = energy;
        this.energyMax = energyMax;
        this.hasSharedVision = true;
    }
}