import SelectIndexHandler from "./_selectIndexHandler";

export default class LookHandler extends SelectIndexHandler {
    constructor(engine) {
        super(engine);
    }

    selectTile() {
        this.exit();
    }
}