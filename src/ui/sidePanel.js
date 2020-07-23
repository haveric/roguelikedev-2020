import { SubMessage, Message } from './message';

export default class SidePanel {
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
        var message = new Message(subMessages);
        this.descriptionPanel.setText(message.getBBCodeFullText());
    }

    createSidePanel() {
        var background = this.scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, 0x4e342e);
        this.sidePanel = this.scene.rexUI.add.sizer({
            x: 0,
            y: 0,
            width: 180,
            height: 500,
            orientation: 'y',
            anchor: {
                left: "100%-200",
            }
        })
        .addBackground(background);

        this.createDescriptionPanel(this.scene);

        this.sidePanel.add(this.descriptionPanel, 0, 'right', { top: 10, bottom: 10, left: 10, right: 10 }, false);
        this.sidePanel.setOrigin(0).layout();
    }

    createDescriptionPanel() {
        this.descriptionPanel = this.scene.rexUI.add.textArea({
            x: 0,
            y: 0,
            width: 180,
            height: 200,
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