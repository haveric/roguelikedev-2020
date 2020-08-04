import RenderOrder from "../renderOrder";
import { PlayerDeadEventHandler, MainGameEventHandler } from "../eventHandler";
import BaseComponent from "./baseComponent";

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

            if (this._hp === 0 && this.parent.ai) {
                this.die();
            }
        }
    }

    takeDamage(amount) {
        this.setHp(this._hp - amount);
    }

    isAtMaxHp() {
        return this._hp === this.hpMax;
    }

    heal(amount) {
        if (this.isAtMaxHp()) {
            return 0;
        }

        let newHp = this._hp + amount;
        if (newHp > this.hpMax) {
            newHp = this.hpMax;
        }

        const amountRecovered = newHp - this._hp;
        this._hp = newHp;

        return amountRecovered;
    }

    die() {
        const engine = this.getEngine();
        const scene = engine.scene;
        if (this.parent === engine.player) {
            engine.eventHandler = new PlayerDeadEventHandler(engine.scene.input, engine);

            engine.player.energy = 0;
            const players = engine.players;
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if (player !== engine.player) {
                    player.deathBoost();
                }

                scene.socket.emit("updateEnergy", { roomId: scene.room.roomId, playerId: player.playerId, energy: player.energy, energyMax: player.energyMax, giveEnergy: false});
            }

            scene.socket.emit("s-playerDied", { roomId: scene.room.roomId, playerId: engine.player.playerId});
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
                engine.eventHandler = new MainGameEventHandler(engine.scene.input, engine);

                scene.socket.emit("s-playerRevived", { roomId: scene.room.roomId, playerId: engine.player.playerId});
                engine.player.energy = 5;
                const players = engine.players;
                for (let i = 0; i < players.length; i++) {
                    const player = players[i];
                    if (player !== engine.player) {
                        player.reviveDrain();
                    }

                    scene.socket.emit("updateEnergy", { roomId: scene.room.roomId, playerId: player.playerId, energy: player.energy, energyMax: player.energyMax, giveEnergy: false});
                }
            }

            this.parent.blocksMovement = true;

            this.getEngine().ui.messageLog.text(this.parent.name, "#" + this.parent.sprite.color).text(" has been revived!").build();
        }

        this.setHp(this.hpMax);
    }
}