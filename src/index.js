import Phaser from "phaser";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import {SceneLobby} from "./scenes/sceneLobby";
import {SceneSetup} from "./scenes/sceneSetup";
import {SceneGame} from "./scenes/sceneGame";
import {SceneGameUI} from "./scenes/sceneGameUI";

var config = {
    type: Phaser.AUTO,
    parent: 'tethered',
    dom: {
        createContainer: true
    },
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: RexUIPlugin,
            mapping: 'rexUI'
        }]
    },
    pixelArt: true,
    backgroundColor: "#000000",
    scene: [SceneLobby, SceneSetup, SceneGame, SceneGameUI]
};

const game = new Phaser.Game(config);
function resize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var xScale = width / 800;
    var yScale = height / 600;
    var scale = Math.min(xScale, yScale);

    var x = Math.ceil(width / scale);
    var y = Math.ceil(height / scale);
    // Avoid odd numbers to prevent artifacts
    if (isOdd(x)) {
        x += 1;
    }

    if (isOdd(y)) {
        y += 1;
    }

    game.scale.resize(x, y);
    game.scale.setZoom(scale);
}

function isOdd(num) {
    return num % 2 === 1;
}

window.addEventListener('load', () => {
    window.addEventListener('resize', () => {
        resize();
    });

    resize();
});
