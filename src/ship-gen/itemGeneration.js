import ItemPrefab from "./itemPrefab";
import EntityFactories from "../entityFactories";
import GameMap from "../gameMap"; // eslint-disable-line no-unused-vars
import { RectangularRoom } from "./roomTypes"; // eslint-disable-line no-unused-vars
import ChoiceIndex from "../utils/choiceIndex";

export default class ItemGenerator {

    /**
     *
     * @param {GameMap} gameMap
     */
    constructor(gameMap) {
        this.gameMap = gameMap;

        this._loaded = false;
        this._chances = [];
        this._items = [];
        this._sumItemWeights = 0;
    }

    /**
     * Spawn an item in the generators currently defined room
     */
    spawnItem() {
        if (this._loaded === false) {
            this.loadWeights();
        }

        if (this.rectangularRoom === null) {
            console.log("Room not defined, cannot spawn item.");
        }

        const coords = this.rectangularRoom.getRandomXYInRoom();

        const entity = this.gameMap.getBlockingEntityAtLocation(coords.x, coords.y);
        if (!entity) {
            const itemSpawnedName = this._generateItem(coords.x, coords.y, this.gameMap);

            console.log("Spawning " + itemSpawnedName + " in: " + this.rectangularRoom);
        }
    }

    /**
     *
     * @param {RectangularRoom} rectangularRoom
     */
    setRoom(rectangularRoom) {
        this.rectangularRoom = rectangularRoom;
    }

    /**
     * @returns {ItemPrefab} prefab
     */
    _selectItem() {
        return this._items[ChoiceIndex.select(this._chances, this._sumItemWeights)];
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