export class SceneGameUI extends Phaser.Scene {
    constructor() {
        super('SceneGameUI');
        this.coordinates = '';
        this.hp = 0;
        this.hpMax = 0;
        this.energy = 0;
        this.energyMax = 0;
        this.enabled = false;
    }

    create() {
        var self = this;
        var game = self.scene.get('SceneGame');

        game.events.on('ui-enable', function() {
            self.enabled = true;

            this.healthBarMax = self.add.rectangle(30, 20, 200, 30).setFillStyle(0xff9898).setOrigin(0);
            this.healthBar = self.add.rectangle(30, 20, 200, 30).setFillStyle(0xff3232).setOrigin(0);

            this.energyBarMax = self.add.rectangle(30, 60, 200, 30).setFillStyle(0xccc300).setOrigin(0);
            this.energyBar = self.add.rectangle(30, 60, 200, 30).setFillStyle(0xfff400).setOrigin(0);

            self.hpText = self.add.text(35, 22, "HP: 0 / 0", {font: "20px Arial", fill: "#ffffff", shadow: { offsetX: 1, offsetY: 1, blur: 2, fill: true } });
            self.energyText = self.add.text(35, 62, "Energy: 0", {font: "20px Arial", fill: "#ffffff", shadow: { offsetX: 1, offsetY: 1, blur: 2, fill: true  } });
            self.coordinateText = self.add.text(30, 100, 'Position: ', {font: "30px Arial", fill: "#ffff00" });
        }, this);

        game.events.on('ui-updateEnergy', function(data) {
            if (self.enabled) {
                self.energy = data.energy;
                self.energyMax = data.energyMax;

                self.energyBar.width = self.energy / self.energyMax * self.energyBarMax.width;
                self.energyText.setText("Energy: " + self.energy);
            }
        }, this);

        game.events.on('ui-updateHp', function(data) {
            if (self.enabled) {
                self.hp = data.hp;
                self.hpMax = data.hpMax

                self.healthBar.width = self.hp / self.hpMax * self.healthBarMax.width;
                self.hpText.setText("HP: " + self.hp + " / " + self.hpMax);
            }
        }, this);

        game.events.on('ui-updateCoordinates', function(coordinateText) {
            if (self.enabled) {
                self.coordinates = coordinateText;

                self.coordinateText.setText("Position: " + self.coordinates.x + ', ' + self.coordinates.y);
            }
        }, this);
    }
}