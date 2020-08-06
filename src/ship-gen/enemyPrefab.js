import SpawnablePrefab from "./spawnablePrefab";

export default class EnemyPrefab extends SpawnablePrefab {
    /**
     * @param  {String} name - Enemy name
     * @param  {Array<integer>} weights - List of weights corresponding to difficulty level
     * @param  {Function} spawnFunc - Function used to spawn an instance of this enemy
     */
    constructor(name, weights, spawnFunc) {
        super(name, weights, spawnFunc);
    }
}