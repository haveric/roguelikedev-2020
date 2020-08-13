import EventHandler from "./_eventHandler";

export default class PlayerDeadEventHandler extends EventHandler {
    constructor(engine) {
        super(engine);

        engine.scene.events.emit("ui-updateHp", { hp: engine.player.fighter.getHp(), hpMax: engine.player.fighter.getMaxHp() });
        engine.ui.inventoryMenu.hide();
    }

    pressKey(/*event*/) {

    }
}