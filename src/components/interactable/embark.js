import Interactable from "../interactable";

export default class Embark extends Interactable {
    constructor(entity) {
        super(entity);
    }

    interact() {
        this.getEngine().scene.generateNewShip();
    }
}
