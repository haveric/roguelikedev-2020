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
        return item;
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

    canAdd(item) {
        if (this.items.length < this.capacity) {
            return true;
        } else {
            let leftToAdd = item.amount;
            for (let i = 0; i < this.items.length; i++) {
                const canMerge = this._getAmountCanMerge(item, this.items[i]);
                leftToAdd -= canMerge;

                if (leftToAdd <= 0) {
                    return true;
                }
            }
        }

        return false;
    }

    _getAmountCanMerge(itemToMerge, existingItem) {
        if (itemToMerge.name === existingItem.name) {
            if (itemToMerge.amount + existingItem.amount < existingItem.maxAmount) {
                return itemToMerge.amount;
            } else {
                return existingItem.maxAmount - existingItem.amount;
            }
        }

        return 0;
    }

    _merge(itemToMerge, existingItem) {
        if (itemToMerge.name === existingItem.name) {
            const total = itemToMerge.amount + existingItem.amount;
            if (total <= existingItem.maxAmount) {
                existingItem.amount = total;
                itemToMerge.amount = 0;
            } else {
                const left = total - existingItem.maxAmount;
                existingItem.amount = existingItem.maxAmount;
                itemToMerge.amount = left;
            }
        }
    }

    _mergeOrAdd(item) {
        for (let i = 0; i < this.items.length; i++) {
            this._merge(item, this.items[i]);

            if (item.amount <= 0) {
                break;
            }
        }

        if (item.amount > 0) {
            this.items.push(item);
        }
    }

    add(item) {
        this._mergeOrAdd(item);
    }

    use(item) {
        const index = this.items.indexOf(item);
        if (index !== -1) {
            const item = this.items[index];
            if (item.amount > 1) {
                item.amount -= 1;
            } else {
                this.items.splice(index, 1);
            }

            return true;
        }

        return false;
    }
}