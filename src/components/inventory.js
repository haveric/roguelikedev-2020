import BaseComponent from "./baseComponent";

export default class Inventory extends BaseComponent {
    constructor(entity, capacity) {
        super(entity);

        this.capacity = capacity;
        this.items = [];
    }

    _dropItem(item) {
        item.place(this.getGameMap(), this.parent.x, this.parent.y);
        this.getEngine().ui.messageLog.text("You dropped the " + item.name + ".").build();
    }

    dropByIndex(index) {
        const item = this.removeByIndex(index);
        if (item) {
            this._dropItem(item);
        }
    }

    dropAll() {
        while(this.items.length) {
            const item = this.items.pop();
            item.place(this.getGameMap(), this.parent.x, this.parent.y);
        }
    }

    removeByIndex(index) {
        if (this.items.length > index) {
            const item = this.items[index];
            this.items.splice(index, 1);
            return item;
        }

        return null;
    }

    add(item) {
        this.items.push(item);
    }

    remove(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);

            return true;
        }

        return false;
    }
}