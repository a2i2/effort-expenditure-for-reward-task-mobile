import PracticeTask from "./scenes/practiceTask.js";
import StartTaskScene from "./scenes/startTaskScene.js";
import MainTask from "./scenes/mainTask.js";
import TaskEndScene from "./scenes/taskEndScene.js";
import { runPractice } from "./versionInfo.js";

const scenes = [
    new StartTaskScene(),
    new MainTask(),
    new TaskEndScene()
];

// Prepend PracticeTask if runPractice is true
if (runPractice) { scenes.unshift(new PracticeTask()) };

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
    scene: scenes,         // construct the experiment from componenent scenes
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

const loadFont = async function(name, url, weight) {
    // Fetch the local file and get the object URL that is tied to the document (DOM), i.e. http://localhost:3000/<uuid>.
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Create a new FontFace with the desired weight to be loaded and added to the document
    const font = new FontFace(name, `url(${blobUrl})`, { weight: weight.toString() });
    await font.load();
    document.fonts.add(font);
}

// Start the game using the configuration defined above
export function runTask() {
    // create new phaser game configured as above
    new Phaser.Game(config);

    Promise.all([
        loadFont('DMSans', './src/assets/fonts/DMSans-Bold.ttf', 700),
        loadFont('DMSans', './src/assets/fonts/DMSans-Regular.ttf', 400)
    ]);
};