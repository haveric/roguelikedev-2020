import { EquipmentSlots } from "./equipmentSlots";
import BaseComponent from "../baseComponent";

export default class Equipment extends BaseComponent {
    constructor(entity, mainHand, offHand) {
        super(entity);
        this.mainHand = mainHand;
        this.offHand = offHand;
    }

    getMaxHpBonus() {
        let bonus = 0;

        if(this.mainHand && this.mainHand.equippable) {
            bonus += this.mainHand.equippable.maxHpBonus;
        }

        if(this.offHand && this.offHand.equippable) {
            bonus += this.offHand.equippable.maxHpBonus;
        }

        return bonus;
    }

    getPowerBonus() {
        let bonus = 0;

        if(this.mainHand && this.mainHand.equippable) {
            bonus += this.mainHand.equippable.powerBonus;
        }

        if(this.offHand && this.offHand.equippable) {
            bonus += this.offHand.equippable.powerBonus;
        }

        return bonus;
    }

    getDefenseBonus() {
        let bonus = 0;

        if(this.mainHand && this.mainHand.equippable) {
            bonus += this.mainHand.equippable.defenseBonus;
        }

        if(this.offHand && this.offHand.equippable) {
            bonus += this.offHand.equippable.defenseBonus;
        }

        return bonus;
    }

    toggleEquip(equippableEntity) {
        const results = [];
        const slot = equippableEntity.equippable.slot;

        if (slot === EquipmentSlots.MAIN_HAND) {
            if(this.mainHand === equippableEntity) {
                this.mainHand = null;
                results.push({"dequipped": equippableEntity});
            } else {
                if (this.mainHand) {
                    results.push({"dequipped": this.mainHand});
                }
                this.mainHand = equippableEntity;
                results.push({"equipped": equippableEntity});
            }
        } else if (slot === EquipmentSlots.OFF_HAND) {
            if(this.offHand === equippableEntity) {
                this.offHand = null;
                results.push({"dequipped": equippableEntity});
            } else {
                if(this.offHand) {
                    results.push({"dequipped": this.offHand});
                }
                this.offHand = equippableEntity;
                results.push({"equipped": equippableEntity});
            }
        }
        return results;
    }
}