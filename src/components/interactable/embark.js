import Interactable from "./_interactable";

export default class Embark extends Interactable {
    constructor(entity) {
        super(entity, true);
    }

    interact() {
        this.getEngine().scene.generateNewShip();
    }
}
