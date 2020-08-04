import BaseComponent from "../baseComponent";

export class Equippable extends BaseComponent {
    constructor(entity, slot, powerBonus, defenseBonus, maxHpBonus) {
        super(entity);
        this.slot = slot;
        this.powerBonus = powerBonus || 0;
        this.defenseBonus = defenseBonus || 0;
        this.maxHpBonus = maxHpBonus || 0;
    }
}