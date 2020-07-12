export class SubMessage {
    constructor(text, color) {
        this.text = text;
        this.color = color;
    }
}

export class Message {
    constructor(subMessages) {
        this.subMessages = subMessages;
        this.count = 1;
    }

    getFullText() {
        var fullText = "";
        for (var i = 0; i < this.subMessages.length; i++) {
            var subMessage = this.subMessages[i];
            fullText += subMessage.text;
        }

        if (this.count > 1) {
            fullText += " (x" + this.count + ")";
        }

        return fullText;
    }

    getBBCodeFullText() {
        var fullText = "";
        for (var i = 0; i < this.subMessages.length; i++) {
            var subMessage = this.subMessages[i];
            fullText += "[color=" + subMessage.color + "]" + subMessage.text + "[/color]";
        }

        if (this.count > 1) {
            fullText += " [color=#000](x" + this.count + ")[/color]";
        }

        fullText += "\n";
        return fullText;
    }

    isEqual(subMessages) {
        if (subMessages.length != this.subMessages.length) {
            return false;
        }

        for (var i = 0; i < this.subMessages.length; i++) {
            var sub = this.subMessages[i];
            var sub2 = subMessages[i];

            if (sub.text != sub2.text || sub.color != sub2.color) {
                return false;
            }
        }

        return true;
    }
}

export class MessageLog {
    constructor() {
        this.messages = [];
        this.builder = [];
    }

    text(text, color) {
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
    }

    createScrollablePanel(scene) {
        var self = this;
        this.messageLog = scene.rexUI.add.textArea({
            x: 0,
            y: 500,
            width: 800,
            height: 100,
            anchor: {
                top: "100%-100",
                centerX: "50%"
            },
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
        }).setOrigin(0).layout();
    }
}