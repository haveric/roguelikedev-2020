import Player from "./entity/player";
import Sprite from "./sprite";
import Fighter from "./components/fighter";
import Srand from "seeded-rand";
import Actor from "./entity/actor";
import Inventory from "./components/inventory";
import Item from "./entity/item";
import { BaseAI, HostileEnemy } from "./components/ai";

import { HealingConsumable, LaserDamageConsumable, ConfusionConsumable, GrenadeDamageConsumable, ResurrectionConsumable } from "./components/consumable";
import Equipment from "./components/equipment/equipment";
import { Equippable } from "./components/equipment/equippable";
import { EquipmentSlots } from "./components/equipment/equipmentSlots";
import MinMax from "./attributeTypes/minMax";

export default class EntityFactories { }

EntityFactories.credits = (x, y, amount) => {
    return new Item(x, y, "Credits", "Used to buy things.", new Sprite("credits"), 10000, amount);
};

EntityFactories.player = (socketId, x, y, name, color, energy, energyMax) => {
    const entity = new Player(socketId, x, y, name, "This is you or your companion, tethered together.", new Sprite("player", color), energy, energyMax);
    entity.setComponent("fighter", new Fighter(entity, 30, 2, new MinMax(4,6)));
    entity.setComponent("ai", new BaseAI(entity));
    entity.setComponent("inventory", new Inventory(entity, 26));
    entity.setComponent("equipment", new Equipment());
    return entity;
};

EntityFactories.targetDummy = (x, y) => {
    const entity = new Actor(x, y, "Target Dummy", "It just stands there, mocking you.", new Sprite("targetDummy"));
    entity.setComponent("fighter", new Fighter(entity, 1, 0, new MinMax(0,0), true));
    entity.setComponent("ai", new BaseAI(entity));
    return entity;
};

EntityFactories.spacePirate = (x, y) => {
    const entity = new Actor(x, y, "Space Pirate", "A Pirate. In space! He has a menacing look.", new Sprite("spacePirate"));
    entity.setComponent("fighter", new Fighter(entity, 16, 1, new MinMax(3,5)));
    entity.setComponent("ai", new HostileEnemy(entity));
    const inventory = new Inventory(entity, 10);
    const creditsAmount = Srand.intInRange(0, 100);
    if (creditsAmount > 0) {
        inventory.add(new EntityFactories.credits(-1, -1, creditsAmount));
    }
    entity.setComponent("inventory", inventory);
    return entity;
};

EntityFactories.attackDog = (x, y) => {
    const entity = new Actor(x, y, "Attack Dog", "Faithful companion to pirates; looking mighty hungry for flesh.", new Sprite("attackDog"), false);
    entity.setComponent("fighter", new Fighter(entity, 10, 0, new MinMax(2,4)));
    entity.setComponent("ai", new HostileEnemy(entity));
    return entity;
};

EntityFactories.automatedTurret = (x, y) => {
    const entity = new Actor(x, y, "Automated Turret", "Deadly Turret, pointing straight at you and defending whatever is nearby from you.", new Sprite("automatedTurret"));
    entity.setComponent("fighter", new Fighter(entity, 20, 2, new MinMax(4,8)));
    entity.setComponent("ai", new HostileEnemy(entity));
    return entity;
};

EntityFactories.medkit = (x, y) => {
    const entity = new Item(x, y, "Medkit", "Can be used to heal a small amount of health.", new Sprite("medkit"), 4);
    entity.setComponent("consumable", new HealingConsumable(entity, 4, "use"));
    return entity;
};

EntityFactories.laserCharge = (x, y) => {
    const entity = new Item(x, y, "Laser Charge", "Shoots a laser at the nearest visible enemy.", new Sprite("laserCharge"), 4);
    entity.setComponent("consumable", new LaserDamageConsumable(entity, 20, 5));
    return entity;
};

EntityFactories.confuseRay = (x, y) => {
    const entity = new Item(x, y, "Confuse Ray", "Confuses the weak-minded temporarily.", new Sprite("confuseRay"), 4);
    entity.setComponent("consumable", new ConfusionConsumable(entity, 10));
    return entity;
};

EntityFactories.grenade = (x, y) => {
    const entity = new Item(x, y, "Grenade", "Standard military issue explosive device. Pull pin and throw.", new Sprite("grenade"), 4);
    entity.setComponent("consumable", new GrenadeDamageConsumable(entity, 12, 3));
    return entity;
};

EntityFactories.resurrectionInjector = (x, y) => {
    const entity = new Item(x, y, "Resurrection Injector", "Brings dead things back to life. What looks like possible side effects has been scratched out.", new Sprite("resurrectionInjector"));
    entity.setComponent("consumable", new ResurrectionConsumable(entity));
    return entity;
};

EntityFactories.directionalShield = (x, y) => {
    const entity = new Item(x, y, "Directional Shield", "Equips in the off hand to provide a minor defense bonus.", new Sprite("shield"), 2);
    entity.setComponent("equippable", new Equippable(entity, EquipmentSlots.OFF_HAND, new MinMax(0,0), 3, 0));
    return entity;
};

EntityFactories.ferventDust = (x, y) => {
    const entity = new Item(x, y, "Fervent Dust", "Equips in the off hand to provide a minor health bonus.", new Sprite("dust"), 2);
    entity.setComponent("equippable", new Equippable(entity, EquipmentSlots.OFF_HAND, new MinMax(0,0), 0, 20));
    return entity;
};

EntityFactories.masterBlaster = (x, y) => {
    const entity = new Item(x, y, "Master Blaster", "Equips in the main hand to provide a minor damage bonus.", new Sprite("blaster"), 2);
    entity.setComponent("equippable", new Equippable(entity, EquipmentSlots.MAIN_HAND, new MinMax(3,5), 0, 0));
    return entity;
};