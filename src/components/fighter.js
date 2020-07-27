import RenderOrder from '../renderOrder';
import Sprite from '../sprite';
import { PlayerDeadEventHandler, MainGameEventHandler } from '../eventHandler';
import BaseComponent from './baseComponent';

export default class Fighter extends BaseComponent {
    constructor(entity, hp, defense, power, invulnerable=false) {
        super(entity);

        this._hp = hp;

        this.hpMax = hp;
        this.defense = defense;
        this.power = power;
        this.invulnerable = invulnerable;
    }

    getHp() {
        return this._hp;
    }

    setHp(hp) {
        if (!this.invulnerable) {
            this._hp = Math.max(0, Math.min(hp, this.hpMax));

            if (this._hp == 0 && this.parent.ai) {
                this.die();
            }
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

        // Save just in case we need to resurrect the entity
        this.parent.originalSpriteName = this.parent.sprite.name;
        this.parent.originalColor = this.parent.sprite.color;
        this.parent.originalAI = this.parent.ai;
        this.parent.originalName = this.parent.name;

        this.getEngine().ui.messageLog.text(this.parent.name, "#" + this.parent.sprite.color).text(" has died!").build();

        this.parent.sprite.updateSprite("corpse", "BF0000");
        this.parent.blocksMovement = false;
        this.parent.ai = null;
        this.parent.name = this.parent.name + "'s corpse";
    }

    revive() {
        var engine = this.getEngine();
        if (this._hp <= 0) {
            this.parent.renderOrder = RenderOrder.ACTOR;
            this.parent.sprite.updateSprite(this.parent.originalSpriteName, this.parent.originalColor);
            this.parent.name = this.parent.originalName;
            this.parent.ai = this.parent.originalAI;
            if (this.parent === engine.player) {
                engine.eventHandler = new MainGameEventHandler(engine.scene.input, engine);
            }

            this.parent.blocksMovement = true;

            this.getEngine().ui.messageLog.text(this.parent.name, "#" + this.parent.sprite.color).text(" has been revived!").build();
        }

        this.setHp(this.hpMax);
    }
}