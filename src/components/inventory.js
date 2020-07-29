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
        var item = this.removeByIndex(index);
        if (item) {
            this._dropItem(item);
        }
    }

    removeByIndex(index) {
        if (this.items.length > index) {
            var item = this.items[index];
            this.items.splice(index, 1);
            return item;
        }

        return null;
    }

    remove(item) {
        var index = this.items.indexOf(item);
        if (index != -1) {
            this.items.splice(index, 1);

            return true;
        }

        return false;
    }
}