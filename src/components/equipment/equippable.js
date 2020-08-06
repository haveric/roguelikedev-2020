import BaseComponent from "../baseComponent";
import MinMax from "../../attributeTypes/minMax";
import { EquipmentSlots } from "./equipmentSlots"; // eslint-disable-line no-unused-vars
import Entity from "../../entity/entity"; // eslint-disable-line no-unused-vars

export class Equippable extends BaseComponent {

    /**
     *
     * @param {Entity} entity
     * @param {EquipmentSlots} slot
     * @param {MinMax} powerBonusMinMax
     * @param {integer} defenseBonus
     * @param {integer} maxHpBonus
     */
    constructor(entity, slot, powerBonusMinMax, defenseBonus, maxHpBonus) {
        super(entity);
        this.slot = slot;
        this.powerBonusMinMax = powerBonusMinMax || new MinMax(0, 0);
        this.defenseBonus = defenseBonus || 0;
        this.maxHpBonus = maxHpBonus || 0;
    }

    /**
     * @returns {integer}
     */
    getPowerBonus() {
        return this.powerBonusMinMax.getRandomValueInRange();
    }
}