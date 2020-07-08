import Entity from './entity';
import Sprite from './sprite';
import RenderOrder from './renderOrder';
import Fighter from './components/fighter';
import { HostileEnemy } from './components/ai';

export default class EntityFactories {}

EntityFactories.spacePirate = (x, y) => {
    var entity = new Entity(x, y, "Space Pirate", new Sprite("spacePirate", "cc0000"), true, RenderOrder.ACTOR);
    entity.setFighter(new Fighter(16, 1, 4));
    entity.setAI(new HostileEnemy(entity));
    return entity;
}
EntityFactories.attackDog = (x, y) => {
    var entity = new Entity(x, y, "Attack Dog", new Sprite("attackDog", "654321"), true, RenderOrder.ACTOR);
    entity.setFighter(new Fighter(10, 0, 3));
    entity.setAI(new HostileEnemy(entity));
    return entity;
}
EntityFactories.automatedTurret = (x, y) => {
    var entity = new Entity(x, y, "Automated Turret", new Sprite("automatedTurret", "222222"), true, RenderOrder.ACTOR);
    entity.setFighter(new Fighter(20, 2, 2));
    entity.setAI(new HostileEnemy(entity));
    return entity;
}

