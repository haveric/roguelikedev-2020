import EnemyPrefab from "./enemyPrefab";
import EntityFactories from "../entityFactories";
import GameMap from "../gameMap"; // eslint-disable-line no-unused-vars
import { RectangularRoom } from "./roomTypes"; // eslint-disable-line no-unused-vars
import ChoiceIndex from "../utils/choiceIndex";

export default class EnemyGenerator {

    /**
     *
     * @param {GameMap} gameMap
     */
    constructor(gameMap) {
        this.gameMap = gameMap;

        this._loaded = false;
        this._chances = [];
        this._enemies = [];
        this._sumEnemyWeights = 0;
    }

    /**
     * Spawn an enemy in the generator's currently defined room
     */
    spawnEnemy() {
        if (this._loaded === false) {
            this.loadWeights();
        }

        if (this.rectangularRoom === null) {
            console.log("Room not defined, cannot spawn item.");
        }

        const coords = this.rectangularRoom.getRandomXYInRoom();

        const entity = this.gameMap.getBlockingEntityAtLocation(coords.x, coords.y);
        if (!entity) {
            const enemySpawnedName = this._generateEnemy(coords.x, coords.y, this.gameMap);

            console.log("Spawning " + enemySpawnedName + " in: " + this.rectangularRoom);
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
     * @returns {EnemyPrefab} prefab
     */
    _selectEnemy() {
        return this._enemies[ChoiceIndex.select(this._chances, this._sumEnemyWeights)];
    }

    /**
     *
     * @param {integer} x - X tile location.
     * @param {integer} y - Y tile location.
     * @param {GameMap} gameMap - GameMap to place enemy on.
     *
     * @returns {string} - EnemyName
     */
    _generateEnemy(x, y, gameMap) {
        const enemyObj = this._selectEnemy();

        enemyObj.spawnFunc(x, y).place(gameMap);
        return enemyObj.name;
    }



    /**
     * Load up the total weights based on adjustments and room info (TODO).
     */
    loadWeights() {
        console.log("Loading up enemy weights!");

        const chances = [];
        const enemies = [];
        let runningSum = 0;

        Object.keys(EnemyRarity).forEach(enemyRarityKey => {
            const enemiesForRarity = EnemyGenerator.EnemyList[EnemyRarity[enemyRarityKey].name];
            const spawnWeight = EnemyRarity[enemyRarityKey].spawnWeight;

            enemiesForRarity.forEach(enemy => {
                runningSum += spawnWeight;
                chances.push(spawnWeight);
                enemies.push(enemy);
            });
        });

        this._loaded = true;
        this._enemies = enemies;
        this._chances = chances;
        this._sumEnemyWeights = runningSum;
    }
}

export const EnemyRarity = {
    Vermin: { name: "Vermin", spawnWeight: 70 },
    Common: { name: "Common", spawnWeight: 25 },
    Uncommon: { name: "Uncommon", spawnWeight: 5 },
    Rare: { name: "Rare", spawnWeight: 1 }
};

EnemyGenerator.EnemyList = {
    "Vermin": [
        new EnemyPrefab("AttackDog", (x, y) => EntityFactories.attackDog(x, y)),
    ],
    "Common": [
        new EnemyPrefab("SpacePirate", (x, y) => EntityFactories.spacePirate(x, y)),
    ],
    "Uncommon": [
        new EnemyPrefab("AutomatedTurret", (x, y) => EntityFactories.automatedTurret(x, y)),
    ],
    "Rare": []
};