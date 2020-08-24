import Phaser from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";
import {SceneLobby} from "./scenes/sceneLobby";
import {SceneSetup} from "./scenes/sceneSetup";
import {SceneGame} from "./scenes/sceneGame";
import {SceneGameUI} from "./scenes/sceneGameUI";

const config = {
    type: Phaser.AUTO,
    parent: "tethered",
    audio: {
        disableWebAudio: true
    },
    dom: {
        createContainer: true
    },
    plugins: {
        scene: [{
            key: "rexUI",
            plugin: RexUIPlugin,
            mapping: "rexUI"
        }]
    },
    pixelArt: true,
    backgroundColor: "#000000",
    scene: [SceneLobby, SceneSetup, SceneGame, SceneGameUI]
};

const game = new Phaser.Game(config);
function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    game.xScale = width / 800;
    game.yScale = height / 600;
    const scale = Math.min(game.xScale, game.yScale);

    let x = Math.ceil(width / scale);
    let y = Math.ceil(height / scale);
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

window.addEventListener("load", () => {
    window.addEventListener("resize", () => {
        resize();
    });

    resize();
});
