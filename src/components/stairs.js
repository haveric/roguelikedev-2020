import BaseComponent from "./baseComponent";

export default class Stairs extends BaseComponent {
    constructor(entity, floor) {
        super(entity);
        this.floor = floor;
    }

    take() {
        const actor = this.getGameMap().getActorAtLocation(this.parent.x, this.parent.y);
        if (actor) {
            const engine = this.getEngine();
            const newGameMap = engine.getGameMap(this.floor);
            if (actor === engine.player) {
                engine.setGameMap(newGameMap);
                engine.createSprites();
            }

            actor.place(newGameMap, this.parent.x, this.parent.y);
            engine.updateFov();

            if (actor === engine.player) {
                engine.scene.updateCameraView();
            }
        }
    }
}
