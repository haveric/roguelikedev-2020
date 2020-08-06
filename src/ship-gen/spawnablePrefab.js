export default class SpawnablePrefab {
    /**
     * @param  {String} name - Prefab name
     * @param  {Array<integer>} weights - List of weights corresponding to difficulty level
     * @param  {Function} spawnFunc - Function used to spawn an instance of this prefab
     */
    constructor(name, weights, spawnFunc) {
        this.name = name;
        this.weights = weights;
        this.spawnFunc = spawnFunc;
    }

    /**
     * @param {integer} difficultyLevel - Difficulty level to grab weight for
     *
     * @returns {integer}
     */
    getWeightForDifficultyLevel(difficultyLevel) {
        if (difficultyLevel < 1) {
            difficultyLevel = 1;
        }

        if (difficultyLevel > this.weights.length) {
            difficultyLevel = this.weights.length;
        }

        if (this.weights === null) {
            return 0;
        }

        return this.weights[difficultyLevel - 1];
    }
}