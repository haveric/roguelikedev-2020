import EnemyPrefab from "./enemyPrefab";
import EntityFactories from "../entityFactories";
import GameMap from "../gameMap"; // eslint-disable-line no-unused-vars
import { RectangularRoom } from "./roomTypes"; // eslint-disable-line no-unused-vars
import ChoiceIndex from "../utils/choiceIndex";

export default class EnemyGenerator {

    /**
     *
     * @param {integer} difficultyLevel - The difficulty level to select the weights for (1-X)
     * @param {GameMap} gameMap - GameMap instance
     */
    constructor(difficultyLevel, gameMap) {
        this.difficultyLevel = difficultyLevel;
        this.gameMap = gameMap;

        this._loaded = false;
        this._enemyChances = {};
        this._enemies = {};
        this._sumEnemyWeights = {};

        this._rarityChances = [];
        this._enemyRarities = [];
        this._sumEnemyRarityWeights = 0;
    }

    /**
     * Spawn an enemy in the generator's currently defined room
     *
     * @param {RectangularRoom} rectangularRoom
     */
    spawnEnemy(rectangularRoom) {
        if (!this._loaded) {
            this.loadWeights();
        }

        const coords = rectangularRoom.getRandomXYInRoom();

        const entity = this.gameMap.getBlockingEntityAtLocation(coords.x, coords.y);
        if (!entity) {
            const enemySpawnedName = this._generateEnemy(coords.x, coords.y, this.gameMap);

            console.log("Spawning " + enemySpawnedName + " in: " + rectangularRoom);
        }
    }

    /**
     * @returns {EnemyPrefab} prefab
     */
    _selectEnemy() {
        const rarity = this._enemyRarities[ChoiceIndex.select(this._rarityChances, this._sumEnemyRarityWeights)];
        return this._enemies[rarity][ChoiceIndex.select(this._enemyChances[rarity], this._sumEnemyWeights[rarity])];
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
        const rarityChances = [];
        const enemyRarities = [];
        let runningSum = 0;
        let runningRaritySum = 0;

        Object.keys(EnemyRarity).forEach(enemyRarityKey => {
            const enemiesForRarity = EnemyGenerator.EnemyList[EnemyRarity[enemyRarityKey].name];
            const raritySpawnWeight = EnemyRarity[enemyRarityKey].spawnWeight;

            runningRaritySum += raritySpawnWeight;
            enemyRarities.push(EnemyRarity[enemyRarityKey].name);
            rarityChances.push(raritySpawnWeight);

            enemies[enemyRarityKey] = [];
            chances[enemyRarityKey] = [];

            // Reset sum
            runningSum = 0;

            enemiesForRarity.forEach(enemy => {
                const enemyWeight = enemy.getWeightForDifficultyLevel(this.difficultyLevel);
                runningSum += enemyWeight;
                chances[enemyRarityKey].push(enemyWeight);
                enemies[enemyRarityKey].push(enemy);
            });

            this._sumEnemyWeights[enemyRarityKey] = runningSum;
        });

        this._loaded = true;
        this._enemies = enemies;
        this._enemyRarities = enemyRarities;
        this._rarityChances = rarityChances;
        this._enemyChances = chances;
        this._sumEnemyRarityWeights = runningRaritySum;
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
        new EnemyPrefab("AttackDog", [10], (x, y) => EntityFactories.attackDog(x, y)),
    ],
    "Common": [
        new EnemyPrefab("SpacePirate", [10], (x, y) => EntityFactories.spacePirate(x, y)),
    ],
    "Uncommon": [
        new EnemyPrefab("AutomatedTurret", [10], (x, y) => EntityFactories.automatedTurret(x, y)),
    ],
    "Rare": []
};