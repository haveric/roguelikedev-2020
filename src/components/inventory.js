import BaseComponent from './baseComponent';

export class Inventory extends BaseComponent {
    constructor(entity, capacity) {
        super(entity);

        this.capacity = capacity;
        this.items = [];
    }

    drop(item) {
        if (this.remove(item)) {
            item.place(this.parent.gameMap, this.parent.x, this.parent.y);
            this.getEngine().messageLog.text("You dropped the " + item.name + ".").build();
        }
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