import EventHandler from "../_eventHandler";
import MainGameEventHandler from "../mainGameEventHandler";

export default class AskUserEventHandler extends EventHandler {
    constructor(engine) {
        super(engine);
    }

    pressKey(event) {
        switch(event.code) {
            case "ShiftLeft":
            case "ShiftRight":
            case "ControlLeft":
            case "ControlRight":
            case "AltLeft":
            case "AltRight":
                break;
            default:
                this.exit();
                break;
        }
    }

    mouseClick(/*event*/) {
        this.exit();
    }

    exit() {
        this.engineRef.eventHandler = new MainGameEventHandler(this.engineRef);
    }
}