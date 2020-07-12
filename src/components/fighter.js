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

        if (this._hp == 0 && this.entityRef.ai) {
            this.die();
        }
    }

    takeDamage(damage) {
        this.setHp(this._hp - damage);
    }

    die() {
        var engine = this.getEngine();
        if (this.entityRef === engine.player) {
            engine.eventHandler.killEvents();
            engine.eventHandler = new PlayerDeadEventHandler(engine.scene.input.keyboard, engine);
        }

        this.entityRef.renderOrder = RenderOrder.CORPSE;

        this.getEngine().messageLog.text(this.entityRef.name, "#" + this.entityRef.sprite.color).text(" has died!").build();

        this.entityRef.sprite.updateSprite("corpse", "BF0000");
        this.entityRef.blocksMovement = false;
        this.entityRef.ai = null;
        this.entityRef.originalName = this.entityRef.name; // Save just in case we need to resurrect the entity
        this.entityRef.name = this.entityRef.name + "'s corpse";

    }
}