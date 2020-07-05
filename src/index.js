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

    if (isOdd(width)) {
        width += 1;
    }

    if (isOdd(height)) {
        height += 1;
    }

    game.scale.resize(width, height);
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
