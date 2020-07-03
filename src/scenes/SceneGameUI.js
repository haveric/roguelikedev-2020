export class SceneGameUI extends Phaser.Scene {
    constructor() {
        super('SceneGameUI');
        this.energy = 0;
        this.enabled = false;
    }

    create() {
        var self = this;
        var game = self.scene.get('SceneGame');

        game.events.on('ui-enable', function() {
            self.enabled = true;
            self.energyText = self.add.text(30, 30, "Energy: 0", {font: "30px Arial", fill: "#ffff00" });
            self.energyText.setScrollFactor(0,0);
        }, this);

        game.events.on('ui-updateEnergy', function(energy) {
            if (self.enabled) {
                self.energy = energy;

                self.energyText.setText("Energy: " + self.energy);
            }
        }, this);
    }
}