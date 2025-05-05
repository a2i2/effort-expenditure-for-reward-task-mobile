// import js modules that hold the game/experiment scenes
import InstructionsScene from "./scenes/instructionsScene.js";
import PracticeTask from "./scenes/practiceTask.js";
import questInstructionsScene from "./scenes/questInstructionsScene.js";
import Questions from "./scenes/Questions.js";
import StartTaskScene from "./scenes/startTaskScene.js";
import MainTask from "./scenes/mainTask.js";
import TaskEndScene from "./scenes/taskEndScene.js";
import { debug_mode, randomiseOrder, sceneOrder } from "./versionInfo.js";
// import { saveStartData } from "./saveData.js";
// log the scene order for checking
if (debug_mode) { console.log('scene order: ' + sceneOrder) };

// create the phaser game, based on the following config
const config = {
    type: Phaser.Scale.AUTO,           // rendering: webGL if available, otherwise canvas
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',       // add light-weight physics to our world
        arcade: {
            gravity: { y: 600 }, // need some gravity for a side-scrolling platformer
            debug: false         // TRUE for debugging game physics, FALSE for deployment
        }
    },
    parent: 'game-container',    // ID of the DOM element to add the canvas to
    dom: {
        createContainer: true    // to allow text input DOM element
    },
    backgroundColor: "#CFEFFC",  // pale blue sky color [black="#222222"],
    scene: sceneOrder.map(sceneName => eval(sceneName)),         // construct the experiment from componenent scenes
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: rexuiplugin,  // load the rexUI plugins here for all scenes
            mapping: 'rexUI'
        }]
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Start the game using the configuration defined above
export function runTask() {
    // create new phaser game configured as above
    new Phaser.Game(config);
};

export { sceneOrder}