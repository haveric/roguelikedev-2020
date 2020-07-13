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