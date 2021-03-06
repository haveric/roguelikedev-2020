import Srand from "seeded-rand";

export default class MinMax {
    /**
     *
     * @param {integer} min
     * @param {integer} max
     */
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    getRandomValueInRange() {
        return Srand.intInRange(this.min, this.max);
    }
}