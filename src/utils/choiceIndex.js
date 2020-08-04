import Srand from "seeded-rand";

export default class ChoiceIndex { }

/**
 *
 * @param {Array<integer>} chances - Array of weights defining the chances for each possible choice.
 * @param {integer} totalItemWeights - Total sum of all weights in the chances array.
 *
 * @returns {integer} - Index of selected choice
 */
ChoiceIndex.select = (chances, totalItemWeights) => {
    const randomChance = Srand.intInRange(1, totalItemWeights);
    let runningSum = 0;
    let choiceIndex = 0;

    console.log("RandomChance selected value of:" + randomChance);

    for (let i = 0; i < chances.length; i++) {
        const weight = chances[i];
        runningSum += weight;

        if (randomChance <= runningSum) {
            break;
        }
        choiceIndex += 1;
    }

    return choiceIndex;
};