import Action from "./_action";
import ActionResult from "../actionResult";

export default class InteractWithTileAction extends Action {
    constructor(entity) {
        super(entity);
    }

    perform(doAction) {
        const actorX = this.entityRef.x;
        const actorY = this.entityRef.y;

        let success;
        if (doAction) {
            this.getGameMap().locations[actorX][actorY].tileComponentRun("interactable", "interact");

            success = true;
        } else {
            const allPlayersRequired = this.getGameMap().locations[actorX][actorY].tileComponentCheck("interactable", "isAllPlayersRequired");
            if (this.getEngine().isEntityAPlayer(this.entityRef) && allPlayersRequired) {
                const players = this.getEngine().players;
                let numSuccesses = 0;

                for (let i = 0; i < players.length; i++) {
                    const player = players[i];
                    if (this.getGameMap().locations[player.x][player.y].tileHasComponent("interactable")) {
                        numSuccesses += 1;
                    }
                }

                if (numSuccesses === players.length) {
                    success = true;
                } else {
                    const messageLog = this.getEngine().ui.messageLog;
                    messageLog.text("You must gather your party before leaving.").build();
                    success = false;
                }
            } else {
                success = this.getGameMap().locations[actorX][actorY].tileHasComponent("interactable");
            }
        }

        return new ActionResult(this, success);
    }

    toString() {
        return { action: "InteractWithTileAction" };
    }
}