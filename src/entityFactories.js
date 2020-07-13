import { Actor } from './entity';
import Player from './player';
import Sprite from './sprite';
import RenderOrder from './renderOrder';
import Fighter from './components/fighter';
import { BaseAI, HostileEnemy } from './components/ai';

export default class EntityFactories {}

EntityFactories.player = (socketId, x, y, name, color, energy, energyMax) => {
    var entity = new Player(socketId, x, y, name, "This is you or your companion, tethered together.", new Sprite("player", color), energy, energyMax);
    entity.setFighter(new Fighter(entity, 30, 2, 5));
    entity.setAI(new BaseAI(entity));
    return entity;
}

EntityFactories.spacePirate = (x, y) => {
    var entity = new Actor(x, y, "Space Pirate", "A Pirate. In space! He has a menacing look.", new Sprite("spacePirate", "cc0000"));
    entity.setFighter(new Fighter(entity, 16, 1, 4));
    entity.setAI(new HostileEnemy(entity));
    return entity;
}
EntityFactories.attackDog = (x, y) => {
    var entity = new Actor(x, y, "Attack Dog", "Faithful companion to pirates; looking mighty hungry for flesh.", new Sprite("attackDog", "654321"));
    entity.setFighter(new Fighter(entity, 10, 0, 3));
    entity.setAI(new HostileEnemy(entity));
    return entity;
}
EntityFactories.automatedTurret = (x, y) => {
    var entity = new Actor(x, y, "Automated Turret", "Deadly Turret, pointing straight at you and defending whatever is nearby from you.", new Sprite("automatedTurret", "222222"));
    entity.setFighter(new Fighter(entity, 20, 2, 2));
    entity.setAI(new HostileEnemy(entity));
    return entity;
}

