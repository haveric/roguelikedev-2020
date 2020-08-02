import GameMap from "./gameMap";
import Player from "./entity/player";
import Sprite from "./sprite";
import Fighter from "./components/fighter";
import Srand from "seeded-rand";
import Actor from "./entity/actor";
import Inventory from "./components/inventory";
import Item from "./entity/item";
import { HealingConsumable, LaserDamageConsumable, ConfusionConsumable, GrenadeDamageConsumable, ResurrectionConsumable } from "./components/consumable";

export default class EntityFactories { }

EntityFactories.credits = (x, y, amount) => {
    return new Item(x, y, "Credits", "Used to buy things.", new Sprite("credits"), 10000, amount);
};

EntityFactories.player = (socketId, x, y, name, color, energy, energyMax) => {
    const entity = new Player(socketId, x, y, name, "This is you or your companion, tethered together.", new Sprite("player", color), energy, energyMax);
    entity.setComponent("fighter", new Fighter(entity, 30, 2, 5));
    entity.setComponent("ai", new BaseAI(entity));
    entity.setComponent("inventory", new Inventory(entity, 26));
    return entity;
};

EntityFactories.targetDummy = (x, y) => {
    const entity = new Actor(x, y, "Target Dummy", "It just stands there, mocking you.", new Sprite("targetDummy"));
    entity.setComponent("fighter", new Fighter(entity, 1, 0, 0, true));
    entity.setComponent("ai", new BaseAI(entity));
    return entity;
};

EntityFactories.spacePirate = (x, y) => {
    const entity = new Actor(x, y, "Space Pirate", "A Pirate. In space! He has a menacing look.", new Sprite("spacePirate"));
    entity.setComponent("fighter", new Fighter(entity, 16, 1, 4));
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
    entity.setComponent("fighter", new Fighter(entity, 10, 0, 3));
    entity.setComponent("ai", new HostileEnemy(entity));
    return entity;
};

EntityFactories.automatedTurret = (x, y) => {
    const entity = new Actor(x, y, "Automated Turret", "Deadly Turret, pointing straight at you and defending whatever is nearby from you.", new Sprite("automatedTurret"));
    entity.setComponent("fighter", new Fighter(entity, 20, 2, 2));
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

export const ItemRarity = {
    Junk: { name: "Junk", spawnChance: .60 },
    Common: { name: "Common", spawnChance: .80 },
    Uncommon: { name: "Uncommon", spawnChance: .94 },
    Rare: { name: "Rare", spawnChance: 1 }
};

// TODO: Convert these objects to a class with docs
EntityFactories.ItemList = {
    "Junk": [
        { name: "Medkit", spawnFunc: (x, y) => EntityFactories.medkit(x, y) },
        { name: "Grenade", spawnFunc: (x, y) => EntityFactories.grenade(x, y) },
    ],
    "Common": [
        { name: "LaserCharge", spawnFunc: (x, y) => EntityFactories.laserCharge(x, y) },
    ],
    "Uncommon": [
        { name: "ConfuseRay", spawnFunc: (x, y) => EntityFactories.confuseRay(x, y) },
    ],
    "Rare": [
        { name: "ResurrectionInjector", spawnFunc: (x, y) => EntityFactories.resurrectionInjector(x, y) },
    ]
};

/**
 * 
 * @param {number} itemChance 
 */
EntityFactories.SelectItemListByChance = (itemChance) => {
    if (itemChance <= ItemRarity.Junk.spawnChance) { return EntityFactories.ItemList[ItemRarity.Junk.name]; }
    else if (itemChance <= ItemRarity.Common.spawnChance) { return EntityFactories.ItemList[ItemRarity.Common.name]; }
    else if (itemChance <= ItemRarity.Uncommon.spawnChance) { return EntityFactories.ItemList[ItemRarity.Uncommon.name]; }
    else if (itemChance <= ItemRarity.Rare.spawnChance) { return EntityFactories.ItemList[ItemRarity.Rare.name]; }
};

/**
 * 
 * @param {integer} x - X tile location
 * @param {integer} y - Y tile location
 * @param {number} itemChance - random gen number (0-1)
 * @param {GameMap} gameMap - GameMap to place item on
 * 
 * @returns {string} itemName
 */
EntityFactories.GenerateItem = (x, y, itemChance, gameMap) => {

    var itemList = EntityFactories.SelectItemListByChance(itemChance);
    var itemObj = itemList[Srand.intInRange(0, itemList.length-1)];

    itemObj.spawnFunc(x,y).place(gameMap);
    return itemObj.name;
};

