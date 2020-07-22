import { Actor, Item } from './entity';
import Player from './player';
import Sprite from './sprite';
import RenderOrder from './renderOrder';
import Fighter from './components/fighter';
import { BaseAI, HostileEnemy } from './components/ai';
import { HealingConsumable, LaserDamageConsumable, ConfusionConsumable } from './components/consumable';
import Inventory from './components/inventory';

export default class EntityFactories {}

EntityFactories.player = (socketId, x, y, name, color, energy, energyMax) => {
    var entity = new Player(socketId, x, y, name, "This is you or your companion, tethered together.", new Sprite("player", color), energy, energyMax);
    entity.setFighter(new Fighter(entity, 30, 2, 5));
    entity.setAI(new BaseAI(entity));
    entity.setInventory(new Inventory(entity, 26));
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

EntityFactories.medkit = (x, y) => {
    var entity = new Item(x, y, "Medkit", "Can be used to heal a small amount of health.", new Sprite("medkit", "7f00ff"));
    entity.setConsumable(new HealingConsumable(entity, 4, "use"));
    return entity;
}

EntityFactories.laserCharge = (x, y) => {
    var entity = new Item(x, y, "Laser Charge", "Shoots a laser at the nearest visible enemy.", new Sprite("laserCharge", "ffff00"));
    entity.setConsumable(new LaserDamageConsumable(entity, 20, 5));
    return entity;
}

EntityFactories.confuseRay = (x, y) => {
    var entity = new Item(x, y, "Confuse Ray", "Confuses the weak-minded temporarily.", new Sprite("confuseRay", "cf3fff"));
    entity.setConsumable(new ConfusionConsumable(entity, 10));
    return entity;
}
