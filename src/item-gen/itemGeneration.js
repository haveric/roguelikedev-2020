import ItemPrefab from "./itemPrefab";
import Srand from "seeded-rand";
import EntityFactories from "../entityFactories";
import GameMap from "../gameMap"; // eslint-disable-line no-unused-vars
import RectangularRoom from "../ship-gen/roomTypes"; // eslint-disable-line no-unused-vars

export default class ItemGenerator {

    /**
     *
     * @param {RectangularRoom} rectangularRoom
     * @param {GameMap} gameMap
     */
    constructor(
        rectangularRoom,
        gameMap
    ) {
        this.rectangularRoom = rectangularRoom;
        this.gameMap = gameMap;

        this._loaded = false;
        this._chances = [];
        this._items = [];
        this._sumItemWeights = 0;
    }

    spawnItem() {

        if (this._loaded === false) {
            this.loadWeights();
        }

        const coords = this.rectangularRoom.getXYInRoom();

        const entity = this.gameMap.getBlockingEntityAtLocation(coords.x, coords.y);
        if (!entity) {
            const itemSpawnedName = this._generateItem(coords.x, coords.y, this.gameMap);

            console.log("Spawning " + itemSpawnedName + " in: " + this.rectangularRoom);
        }
    }

    /**
     * @returns {ItemPrefab} prefab
     */
    _selectItem() {
        return this._items[this._choiceIndex()];
    }

    /**
     *
     * @param {integer} x - X tile location
     * @param {integer} y - Y tile location
     * @param {GameMap} gameMap - GameMap to place item on
     *
     * @returns {string} itemName
     */
    _generateItem(x, y, gameMap) {

        const itemObj = this._selectItem();

        itemObj.spawnFunc(x, y).place(gameMap);
        return itemObj.name;
    }

    _choiceIndex() {

        if (this._loaded === false) {
            this.loadWeights();
        }

        const randomChance = Srand.intInRange(1, this._sumItemWeights);
        let runningSum = 0;
        let choiceIndex = 0;

        console.log("RandomChance selected value of:" + randomChance);

        for (let i = 0; i < this._chances.length; i++) {
            const weight = this._chances[i];
            runningSum += weight;

            if (randomChance <= runningSum) {
                break;
            }
            choiceIndex += 1;
        }

        return choiceIndex;
    }

    /**
     * Load up the total weights based on adjustments and room info (TODO)
     */
    loadWeights() {
        const chances = [];
        const items = [];
        let runningSum = 0;

        Object.keys(ItemRarity).forEach(itemRarityKey => {
            const itemsForRarity = ItemGenerator.ItemList[ItemRarity[itemRarityKey].name];
            const spawnWeight = ItemRarity[itemRarityKey].spawnWeight;

            itemsForRarity.forEach(item => {
                runningSum += spawnWeight;
                chances.push(spawnWeight);
                items.push(item);
            });
        });

        this._loaded = true;
        this._items = items;
        this._chances = chances;
        this._sumItemWeights = runningSum;
    }
}

export const ItemRarity = {
    Junk: { name: "Junk", spawnWeight: 30 },
    Common: { name: "Common", spawnWeight: 20 },
    Uncommon: { name: "Uncommon", spawnWeight: 5 },
    Rare: { name: "Rare", spawnWeight: 1 }
};

ItemGenerator.ItemList = {
    "Junk": [
        new ItemPrefab("Medkit", (x, y) => EntityFactories.medkit(x, y)),
        new ItemPrefab("Grenade", (x, y) => EntityFactories.grenade(x, y)),
    ],
    "Common": [
        new ItemPrefab("LaserCharge", (x, y) => EntityFactories.laserCharge(x, y)),
    ],
    "Uncommon": [
        new ItemPrefab("ConfuseRay", (x, y) => EntityFactories.confuseRay(x, y)),
    ],
    "Rare": [
        new ItemPrefab("ResurrectionInjector", (x, y) => EntityFactories.resurrectionInjector(x, y)),
    ]
};