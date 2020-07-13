import { SubMessage, Message } from './message';

export class SidePanel {
    constructor() {
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

    createSidePanel(scene) {
        var background = scene.rexUI.add.roundRectangle(0, 0, 10, 10, 0, 0x4e342e);
        this.sidePanel = scene.rexUI.add.sizer({
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

        this.createDescriptionPanel(scene);

        this.sidePanel.add(this.descriptionPanel, 0, 'right', { top: 10, bottom: 10, left: 10, right: 10 }, false);
        this.sidePanel.setOrigin(0).layout();
    }

    createDescriptionPanel(scene) {
        this.descriptionPanel = scene.rexUI.add.textArea({
            x: 0,
            y: 0,
            width: 180,
            height: 200,
            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xeeeeee),
            text: scene.rexUI.add.BBCodeText(),
            slider: {
                track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x260e04),
                thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0x7b5e57),
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