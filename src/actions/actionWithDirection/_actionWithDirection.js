import Action from "../action/_action";

export default class ActionWithDirection extends Action {
    constructor(entity, dx, dy) {
        super(entity);

        this.dx = dx;
        this.dy = dy;
    }

    _getDestXY() {
        return { x: this.entityRef.x + this.dx, y: this.entityRef.y + this.dy };
    }

    _getBlockingEntity() {
        const destXY = this._getDestXY();
        return this.getGameMap().getBlockingEntityAtLocation(destXY.x, destXY.y);
    }

    getTargetActor() {
        const destXY = this._getDestXY();
        return this.getGameMap().getActorAtLocation(destXY.x, destXY.y);
    }

    perform(/*doAction*/) {
        console.error("Not Implemented");
    }
}