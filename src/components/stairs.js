import BaseComponent from "./baseComponent";

export default class Stairs extends BaseComponent {
    constructor(entity, floor) {
        super(entity);
        this.floor = floor;
    }

    take() {
        var actor = this.getGameMap().getActorAtLocation(this.parent.x, this.parent.y);
        if (actor) {
            var engine = this.getEngine();
            var newGameMap = engine.getGameMap(this.floor);
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
