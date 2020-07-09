import { Actor } from './entity';
import Player from './player';
import Sprite from './sprite';
import RenderOrder from './renderOrder';
import Fighter from './components/fighter';
import { BaseAI, HostileEnemy } from './components/ai';

export default class EntityFactories {}

EntityFactories.player = (socketId, x, y, name, color, energy, energyMax) => {
    var entity = new Player(socketId, x, y, name, new Sprite("player", color), energy, energyMax);
    entity.setFighter(new Fighter(30, 2, 5));
    entity.setAI(new BaseAI(entity));
    return entity;
}

EntityFactories.spacePirate = (x, y) => {
    var entity = new Actor(x, y, "Space Pirate", new Sprite("spacePirate", "cc0000"));
    entity.setFighter(new Fighter(16, 1, 4));
    entity.setAI(new HostileEnemy(entity));
    return entity;
}
EntityFactories.attackDog = (x, y) => {
    var entity = new Actor(x, y, "Attack Dog", new Sprite("attackDog", "654321"));
    entity.setFighter(new Fighter(10, 0, 3));
    entity.setAI(new HostileEnemy(entity));
    return entity;
}
EntityFactories.automatedTurret = (x, y) => {
    var entity = new Actor(x, y, "Automated Turret", new Sprite("automatedTurret", "222222"));
    entity.setFighter(new Fighter(20, 2, 2));
    entity.setAI(new HostileEnemy(entity));
    return entity;
}

