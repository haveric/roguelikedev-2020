export class SceneGameUI extends Phaser.Scene {
    constructor() {
        super('SceneGameUI');
        this.coordinates = '';
        this.hp = 0;
        this.maxHp = 0;
        this.energy = 0;
        this.enabled = false;
    }

    create() {
        var self = this;
        var game = self.scene.get('SceneGame');

        game.events.on('ui-enable', function() {
            self.enabled = true;
            self.hpText = self.add.text(30, 30, "HP: 0 / 0", {font: "30px Arial", fill: "#ffff00" });
            self.energyText = self.add.text(30, 60, "Energy: 0", {font: "30px Arial", fill: "#ffff00" });
            self.coordinateText = self.add.text(30, 90, 'Position: ', {font: "30px Arial", fill: "#ffff00" });
        }, this);

        game.events.on('ui-updateEnergy', function(energy) {
            if (self.enabled) {
                self.energy = energy;

                self.energyText.setText("Energy: " + self.energy);
            }
        }, this);

        game.events.on('ui-updateHp', function(data) {
            if (self.enabled) {
                self.hp = data.hp;
                self.maxHp = data.maxHp

                self.hpText.setText("HP: " + self.hp + " / " + self.maxHp);
            }
        }, this);

        game.events.on('ui-updateCoordinates', function(coordinateText) {
            if (self.enabled) {
                self.coordinates =  coordinateText;

                self.coordinateText.setText("Position: " + self.coordinates.x + ', ' + self.coordinates.y);
            }
        }, this);
    }
}