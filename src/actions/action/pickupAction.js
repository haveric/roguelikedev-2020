import Action from "./_action";
import ActionResult from "../actionResult";

export default class PickupAction extends Action {
    constructor(entity) {
        super(entity);
    }

    perform(doAction) {
        const actorX = this.entityRef.x;
        const actorY = this.entityRef.y;

        const inventory = this.entityRef.inventory;

        const items = this.getGameMap().getItems();
        const messageLog = this.getEngine().ui.messageLog;
        if (items.length === 0) {
            if (this.isCurrentPlayer()) {
                messageLog.text("There is nothing here to pick up.").build();
            }

            return new ActionResult(this, false);
        } else {
            let success = false;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (actorX === item.x && actorY === item.y) {
                    if (!inventory.canAdd(item)) {
                        if (this.isCurrentPlayer()) {
                            messageLog.text("Your inventory is full.").build();
                        }
                        success = false;
                        break;
                    }

                    const index = this.getGameMap().entities.indexOf(item);
                    if (index !== -1) {
                        if (doAction) {
                            this.getGameMap().entities.splice(index, 1);
                            item.parent = this.entityRef.inventory;
                            item.sprite.destroy();
                            inventory.add(item);

                            let playerString;
                            if (this.isCurrentPlayer()) {
                                playerString = "You";
                            } else {
                                playerString = this.entityRef.name;
                            }
                            messageLog.text(playerString + " picked up the " + item.name + "!").build();
                        }

                        success = true;
                    }
                }
            }

            return new ActionResult(this, success);
        }
    }

    toString() {
        return { action: "PickupAction" };
    }
}