import BaseComponent from './baseComponent';

export class Inventory extends BaseComponent {
    constructor(entity, capacity) {
        super(entity);

        this.capacity = capacity;
        this.items = [];
    }

    drop(item) {
        var index = this.items.indexOf(item);

        if (index != -1) {
            this.items.splice(index, 1);
            item.place(this.entityRef.gameMap, this.entityRef.x, this.entityRef.y);
            this.getEngine().messageLog.text("You dropped the " + item.name + ".").build();
        }
    }
}