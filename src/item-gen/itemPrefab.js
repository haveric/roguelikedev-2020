export default class ItemPrefab {
    /**
     * @param  {String} name
     * @param  {Function} spawnFunc
     */
    constructor(name, spawnFunc) {
        this.name = name;
        this.spawnFunc = spawnFunc;
    }
}