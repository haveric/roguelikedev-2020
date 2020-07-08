import RenderOrder from '../renderOrder';
import Sprite from '../sprite';
import BaseComponent from './baseComponent';

export default class Fighter extends BaseComponent {
    constructor(entity, hp, defense, power) {
        super(entity);

        this._hp = hp;

        this.maxHp = hp;
        this.defense = defense;
        this.power = power;
    }

    getHp() {
        return this._hp;
    }

    setHp(hp) {
        this._hp = Math.max(0, Math.min(hp, this.maxHp));
    }

    die() {
        var deathMessage = this.entity.name + " has died!";
        this.entity.renderOrder = RenderOrder.CORPSE;

        this.entity.setSprite(new Sprite("corpse", "BF0000"));
        this.entity.blocksMovement = false;
        this.entity.ai = null;
        this.entity.name = this.entity.name + "'s corpse";

        console.log(deathMessage);
    }
}