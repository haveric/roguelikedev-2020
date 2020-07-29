import { SubMessage, Message } from "./message";

export default class MessageLog {
    constructor(scene) {
        this.scene = scene;
        this.messages = [];
        this.builder = [];
    }

    text(text, color="#333333") {
        this.builder.push(new SubMessage(text, color));
        return this; // Allow chaining
    }

    build(stack=true) {
        this.addSplitMessage(this.builder.slice(0), stack);
        this.builder = [];
    }

    addSplitMessage(subMessages, stack=true) {
        if (stack && this.messages.length > 0) {
            var lastMessage = this.messages[this.messages.length - 1];
            if (lastMessage.isEqual(subMessages)) {
                lastMessage.count += 1;
            } else {
                this.messages.push(new Message(subMessages));
            }
        } else {
            this.messages.push(new Message(subMessages));
        }

        this.updateMessageLog();
    }

    updateMessageLog() {
        var fullLog = "";
        for (var i = 0; i < this.messages.length; i++) {
            var message = this.messages[i];
            fullLog += message.getBBCodeFullText();
        }

        this.messageLog.setText(fullLog);
        this.messageLog.scrollToBottom();
    }

    createScrollablePanel() {
        this.messageLog = this.scene.rexUI.add.textArea({
            x: 0,
            y: 500,
            width: 800,
            height: 100,
            anchor: {
                top: "100%-100",
                centerX: "50%"
            },
            background: this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xeeeeee),
            text: this.scene.rexUI.add.BBCodeText(),
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
        }).setOrigin(0).layout();
    }
}