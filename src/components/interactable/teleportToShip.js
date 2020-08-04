import Interactable from "../interactable";

export default class TeleportToShip extends Interactable {
    constructor(entity, shipName) {
        super(entity, true);
        this.shipName = shipName;
    }

    interact() {
        const gameMap = this.getEngine().getGameMap(this.shipName);
        this.getEngine().setGameMap(gameMap);

        this.getEngine().createSprites();

        for (let i = 0; i < this.getEngine().players.length; i++) {
            const player = this.getEngine().players[i];
            player.place(gameMap, 16 + i, 14);
        }

        this.getEngine().updateFov();
        this.getEngine().scene.updateCameraView();
    }
}
