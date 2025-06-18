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

const config = function() {
    // Create a config object when requested, rather than when this JS file is loaded.
    // This ensures its more likely that the height and width is correct.
    return {
        type: Phaser.AUTO,           // rendering: webGL if available, otherwise canvas
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
}

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
    Promise.all([
        loadFont('DMSans', './src/assets/fonts/DMSans-Bold.ttf', 700),
        loadFont('DMSans', './src/assets/fonts/DMSans-Regular.ttf', 400)
    ]).then(() => {
        window.game = new Phaser.Game(config());
    });
};

// Update the game config height and width used in the scenes.
window.addEventListener('resize', () => {
    if (window.game) {
        window.game.config.height = window.innerHeight;
        window.game.config.width = window.innerWidth;
    } else {
        console.warn("Game not initialized yet, resizing will not work.");
    }
});