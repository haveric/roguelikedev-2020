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
    width: 800,
    height: 600,
    pixelArt: true,
    backgroundColor: "#000000",
    scene: [SceneLobby, SceneSetup, SceneGame, SceneGameUI]
};

let game = new Phaser.Game(config);