import Entity from './entity';
import Sprite from './sprite';

export default class EntityFactories {

}

EntityFactories.spacePirate = new Entity(-1, -1, "Space Pirate", new Sprite("spacePirate", "cc0000"), true);
EntityFactories.attackDog = new Entity(-1, -1, "Attack Dog", new Sprite("attackDog", "654321"), true);
EntityFactories.automatedTurret = new Entity(-1, -1, "Automated Turret", new Sprite("automatedTurret", "222222"), true);

