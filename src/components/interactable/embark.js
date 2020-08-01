import Interactable from "../interactable";

export default class Embark extends Interactable {
    constructor(entity, floor) {
        super(entity);
        this.floor = floor;
    }

    interact() {
        this.getEngine().teardown();
        this.getEngine().scene.generateNewShip();
    }
}
