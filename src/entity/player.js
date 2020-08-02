import Sprite from "../sprite"; // eslint-disable-line no-unused-vars
import Actor from "./actor";

export default class Player extends Actor {
    /**
     * @param socketId {string} - ID of the Player's socket.
     * @param x {integer} - X tile coordinate of the Player (from left->right).
     * @param y {integer} - Y tile coordinate of the Player (from top->bottom).
     * @param name {string} - Name of the Player.
     * @param description {string} - Description of the Player.
     * @param sprite {Sprite} - Sprite of the Player.
     * @param energy {integer} - The movement energy of the Player.
     * @param energyMax {integer} - The maximum movement energy of the Player.
     */
    constructor(socketId, x, y, name, description, sprite, energy, energyMax) {
        super(x, y, name, description, sprite);

        this.playerId = socketId;
        this.energy = energy;
        this.energyMax = energyMax;
        this.hasSharedVision = true;
    }
}