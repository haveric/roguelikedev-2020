import RenderOrder from "../renderOrder";
import Entity from "./entity";

export default class Item extends Entity {
    /**
     * @param x {integer} - X tile coordinate of the Item (from left->right).
     * @param y {integer} - Y tile coordinate of the Item (from top->bottom).
     * @param name {string} - Name of the Item.
     * @param description {string} - Description of the Item.
     * @param sprite {Sprite} - Sprite of the Item.
     * @param maxAmount {integer} - Max number of items a stack can hold
     * @param amount {integer} - Number of items in a stack.
     */
    constructor(x, y, name, description, sprite,  maxAmount=1, amount=1) {
        super(x, y, name, description, sprite, false, RenderOrder.ITEM);

        this.maxAmount = maxAmount;
        this.amount = amount;
    }
}