export default class ActionResult {
    constructor(action, success, useEnergy) {
        this.action = action;
        this.success = success;
        this.useEnergy = useEnergy;
        if (this.useEnergy === undefined) {
            this.useEnergy = success;
        }
    }
}