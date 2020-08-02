import { SubMessage, Message } from "./message";

export default class InventoryMenu {
    constructor(scene) {
        this.scene = scene;
        this.description = [];
    }

    text(text, color="#333333") {
        this.description.push(new SubMessage(text, color));
        return this; // Allow chaining
    }

    build() {
        this.setDescription(this.description.slice(0));
        this.description = [];
    }

    setDescription(subMessages) {
        const message = new Message(subMessages);
        this.descriptionPanel.setText(message.getBBCodeFullText());
    }

    show() {
        this.inventoryMenu.visible = true;
    }

    hide() {
        this.inventoryMenu.visible = false;
    }

    createInventoryMenu() {
        const background = this.scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, 0x4e342e);
        this.inventoryMenu = this.scene.rexUI.add.sizer({
            x: 0,
            y: 0,
            width: 300,
            height: 500,
            orientation: "y",
            anchor: {
                left: "50%-150",
            }
        })
        .addBackground(background);

        this.createDescriptionPanel();

        this.inventoryMenu.add(this.descriptionPanel, 0, "right", { top: 10, bottom: 10, left: 10, right: 10 }, false);
        this.inventoryMenu.setOrigin(0).layout();
        this.inventoryMenu.visible = false;
    }

    createDescriptionPanel() {
        this.descriptionPanel = this.scene.rexUI.add.textArea({
            x: 0,
            y: 0,
            width: 280,
            height: 480,
            background: this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xeeeeee),
            text: this.scene.rexUI.add.BBCodeText(0, 0, "", {fontSize: "12px"}),
            slider: {
                track: this.scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x260e04),
                thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0x7b5e57),
            },
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                panel: 10,
            }
        });
    }
}