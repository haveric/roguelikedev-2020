import RenderOrder from "../utils/renderOrder";
import BaseComponent from "./_baseComponent";
import Entity from "../entity/_entity"; // eslint-disable-line no-unused-vars
import MinMax from "../attributeTypes/minMax"; // eslint-disable-line no-unused-vars
import PlayerDeadEventHandler from "../eventHandler/playerDeadEventHandler";
import MainGameEventHandler from "../eventHandler/mainGameEventHandler";

export default class Fighter extends BaseComponent {
    /**
     *
     * @param {Entity} entity
     * @param {integer} hp
     * @param {integer} defense
     * @param {MinMax} powerMinMax
     * @param {boolean} invulnerable
     */
    constructor(entity, hp, defense, powerMinMax, invulnerable = false) {
        super(entity);

        this._hp = hp;
        this.baseHpMax = hp;
        this.baseDefense = defense;
        this.basePowerMinMax = powerMinMax;
        this.invulnerable = invulnerable;
    }

    getMaxHp() {
        let bonus = 0;
        if (this.parent.equipment) {
            bonus = this.parent.equipment.getMaxHpBonus();
        }
        return this.baseHpMax + bonus;
    }

    getPower() {
        let bonus = 0;
        if (this.parent.equipment) {
            bonus = this.parent.equipment.getPowerBonus();
        }
        return this.basePowerMinMax.getRandomValueInRange() + bonus;
    }

    getDefense() {
        let bonus = 0;
        if (this.parent.equipment) {
            bonus = this.parent.equipment.getDefenseBonus();
        }
        return this.baseDefense + bonus;
    }

    getHp() {
        return this._hp;
    }

    setHp(hp) {
        if (!this.invulnerable) {
            this._hp = Math.max(0, Math.min(hp, this.getMaxHp()));

            if (this._hp === 0 && this.parent.ai) {
                this.die();
            }
        }
    }

    takeDamage(amount) {
        this.setHp(this._hp - amount);
    }

    isAtMaxHp() {
        return this._hp === this.getMaxHp();
    }

    heal(amount) {
        if (this.isAtMaxHp()) {
            return 0;
        }

        let newHp = this._hp + amount;
        if (newHp > this.getMaxHp()) {
            newHp = this.getMaxHp();
        }

        const amountRecovered = newHp - this._hp;
        this._hp = newHp;

        return amountRecovered;
    }

    die() {
        const engine = this.getEngine();
        const scene = engine.scene;
        if (this.parent === engine.player) {
            engine.eventHandler = new PlayerDeadEventHandler(engine);

            engine.player.energy = 0;
            const players = engine.players;
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if (player !== engine.player) {
                    player.deathBoost();
                }

                scene.socket.emit("server-updateEnergy", { energy: player.energy, energyMax: player.energyMax, giveEnergy: false });
            }

            scene.socket.emit("server-playerDied");
        }

        this.parent.renderOrder = RenderOrder.CORPSE;

        // Save just in case we need to resurrect the entity
        this.parent.originalSpriteName = this.parent.sprite.name;
        this.parent.originalColor = this.parent.sprite.color;
        this.parent.originalAI = this.parent.ai;
        this.parent.originalName = this.parent.name;

        this.getEngine().ui.messageLog.text(this.parent.name, "#" + this.parent.sprite.color).text(" has died!").build();

        this.parent.sprite.updateSprite("corpse");
        this.parent.blocksMovement = false;
        this.parent.ai = null;
        this.parent.name = this.parent.name + "'s corpse";
        if (this.parent.inventory) {
            this.parent.inventory.dropAll();
        }
    }

    revive() {
        const engine = this.getEngine();
        const scene = engine.scene;
        if (this._hp <= 0) {
            this.parent.renderOrder = RenderOrder.ACTOR;
            this.parent.sprite.updateSprite(this.parent.originalSpriteName, this.parent.originalColor);
            this.parent.name = this.parent.originalName;
            this.parent.ai = this.parent.originalAI;
            if (this.parent === engine.player) {
                engine.eventHandler = new MainGameEventHandler(engine);

                scene.socket.emit("server-playerRevived");
                engine.player.energy = 5;
                const players = engine.players;
                for (let i = 0; i < players.length; i++) {
                    const player = players[i];
                    if (player !== engine.player) {
                        player.reviveDrain();
                    }

                    scene.socket.emit("server-updateEnergy", { energy: player.energy, energyMax: player.energyMax, giveEnergy: false });
                }
            }

            this.parent.blocksMovement = true;

            this.getEngine().ui.messageLog.text(this.parent.name, "#" + this.parent.sprite.color).text(" has been revived!").build();
        }

        this.setHp(this.getMaxHp());
    }
}