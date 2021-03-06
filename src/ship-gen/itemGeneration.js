import ItemPrefab from "./itemPrefab";
import EntityFactories from "../entityFactories";
import GameMap from "../gameMap"; // eslint-disable-line no-unused-vars
import { RectangularRoom } from "./roomTypes"; // eslint-disable-line no-unused-vars
import ChoiceIndex from "../utils/choiceIndex";

export default class ItemGenerator {

    /**
     *
     * @param {integer} difficultyLevel - The difficulty level to select the weights for (1-X)
     * @param {GameMap} gameMap - GameMap instance
     */
    constructor(difficultyLevel, gameMap) {
        this.difficultyLevel = difficultyLevel;
        this.gameMap = gameMap;

        this._loaded = false;
        this._itemChances = {};
        this._items = {};
        this._sumItemWeights = {};

        this._rarityChances = [];
        this._itemRarities = [];
        this._sumItemRarityWeights = 0;
    }

    /**
     * Spawn an item in the generators currently defined room
     *
     * @param {RectangularRoom} rectangularRoom
     */
    spawnItem(rectangularRoom) {
        if (!this._loaded) {
            this.loadWeights();
        }

        const coords = rectangularRoom.getRandomXYInRoom();

        const entity = this.gameMap.getBlockingEntityAtLocation(coords.x, coords.y);
        if (!entity) {
            const itemSpawnedName = this._generateItem(coords.x, coords.y, this.gameMap);

            console.log("Spawning " + itemSpawnedName + " in: " + rectangularRoom);
        }
    }

    /**
     * @returns {ItemPrefab} prefab
     */
    _selectItem() {
        const rarity = this._itemRarities[ChoiceIndex.select(this._rarityChances, this._sumItemRarityWeights)];
        return this._items[rarity][ChoiceIndex.select(this._itemChances[rarity], this._sumItemWeights[rarity])];
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

    /**
     * Load up the total weights based on adjustments and room info (TODO)
     */
    loadWeights() {
        console.log("Loading up item weights!");

        const chances = [];
        const items = [];
        const rarityChances = [];
        const itemRarities = [];
        let runningSum = 0;
        let runningRaritySum = 0;

        Object.keys(ItemRarity).forEach(itemRarityKey => {
            const itemsForRarity = ItemGenerator.ItemList[ItemRarity[itemRarityKey].name];
            const raritySpawnWeight = ItemRarity[itemRarityKey].spawnWeight;

            runningRaritySum += raritySpawnWeight;
            itemRarities.push(ItemRarity[itemRarityKey].name);
            rarityChances.push(raritySpawnWeight);

            items[itemRarityKey] = [];
            chances[itemRarityKey] = [];

            // Reset sum
            runningSum = 0;

            itemsForRarity.forEach(item => {
                const itemWeight = item.getWeightForDifficultyLevel(this.difficultyLevel);
                runningSum += itemWeight;
                chances[itemRarityKey].push(itemWeight);
                items[itemRarityKey].push(item);
            });

            this._sumItemWeights[itemRarityKey] = runningSum;
        });

        this._loaded = true;
        this._items = items;
        this._itemRarities = itemRarities;
        this._rarityChances = rarityChances;
        this._itemChances = chances;
        this._sumItemRarityWeights = runningRaritySum;
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
        new ItemPrefab("Medkit", [10], (x, y) => EntityFactories.medkit(x, y)),
        new ItemPrefab("Grenade", [5, 6, 7, 8, 9, 10], (x, y) => EntityFactories.grenade(x, y)),
    ],
    "Common": [
        new ItemPrefab("LaserCharge", [10], (x, y) => EntityFactories.laserCharge(x, y)),
    ],
    "Uncommon": [
        new ItemPrefab("ConfuseRay", [10], (x, y) => EntityFactories.confuseRay(x, y)),
        new ItemPrefab("DirectionalShield", [5], (x, y) => EntityFactories.directionalShield(x, y)),
        new ItemPrefab("MasterBlaster", [2], (x, y) => EntityFactories.masterBlaster(x, y)),
    ],
    "Rare": [
        new ItemPrefab("ResurrectionInjector", [10], (x, y) => EntityFactories.resurrectionInjector(x, y)),
        new ItemPrefab("FerventDust", [10], (x, y) => EntityFactories.ferventDust(x, y)),
    ]
};