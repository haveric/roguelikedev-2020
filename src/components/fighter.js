import RenderOrder from '../renderOrder';
import Sprite from '../sprite';
import { PlayerDeadEventHandler } from '../eventHandler';
import BaseComponent from './baseComponent';

export default class Fighter extends BaseComponent {
    constructor(entity, hp, defense, power) {
        super(entity);

        this._hp = hp;

        this.hpMax = hp;
        this.defense = defense;
        this.power = power;
    }

    getHp() {
        return this._hp;
    }

    setHp(hp) {
        this._hp = Math.max(0, Math.min(hp, this.hpMax));

        if (this._hp == 0 && this.parent.ai) {
            this.die();
        }
    }

    takeDamage(amount) {
        this.setHp(this._hp - amount);
    }

    heal(amount) {
        if (this._hp == this.hpMax) {
            return 0;
        }

        var newHp = this._hp + amount;
        if (newHp > this.hpMax) {
            newHp = this.hpMax;
        }

        var amountRecovered = newHp - this._hp;
        this._hp = newHp;

        return amountRecovered;
    }

    die() {
        var engine = this.getEngine();
        if (this.parent === engine.player) {
            engine.eventHandler = new PlayerDeadEventHandler(engine.scene.input, engine);
        }

        this.parent.renderOrder = RenderOrder.CORPSE;

        this.getEngine().messageLog.ui.text(this.parent.name, "#" + this.parent.sprite.color).text(" has died!").build();

        this.parent.sprite.updateSprite("corpse", "BF0000");
        this.parent.blocksMovement = false;
        this.parent.ai = null;
        this.parent.originalName = this.parent.name; // Save just in case we need to resurrect the entity
        this.parent.name = this.parent.name + "'s corpse";

    }
}