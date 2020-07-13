import { Actor } from './entity';
import RenderOrder from './renderOrder';

export default class Player extends Actor {
    constructor(socketId, x, y, name, description, sprite, energy, energyMax) {
        super(x, y, name, description, sprite);

        this.playerId = socketId;
        this.energy = energy;
        this.energyMax = energyMax;
        this.hasSharedVision = true;
    }
}