import Interactable from "../interactable";

export default class LeaveShip extends Interactable {
    constructor(entity) {
        super(entity);
    }

    interact() {
        const playerGameMap = this.getEngine().getGameMap("player");
        this.getEngine().setGameMap(playerGameMap);

        this.getEngine().createSprites();

        for (let i = 0; i < this.getEngine().players.length; i++) {
            const player = this.getEngine().players[i];
            player.place(playerGameMap, 16 + i, 14);
        }

        this.getEngine().updateFov();
        this.getEngine().scene.updateCameraView();
    }
}
