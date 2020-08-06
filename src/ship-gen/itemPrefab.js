import SpawnablePrefab from "./spawnablePrefab";

export default class ItemPrefab extends SpawnablePrefab {
    /**
     * @param  {String} name - Item name
     * @param  {Array<integer>} weights - List of weights corresponding to difficulty level
     * @param  {Function} spawnFunc - Function used to spawn an instance of this item
     */
    constructor(name, weights, spawnFunc) {
        super(name, weights, spawnFunc);
    }
}