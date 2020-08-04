export default class ItemPrefab {
    /**
     * @param  {String} name
     * @param  {Integer} weight
     * @param  {Function} spawnFunc
     */
    constructor(name, weight, spawnFunc) {
        this.name = name;
        this.weight = weight;
        this.spawnFunc = spawnFunc;
    }
}