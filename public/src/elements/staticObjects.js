// Every image requires a unique y coordinate because of the different sizes
let staticObjects = [
    { key: 'bush-bunny-left', y: 450 },
    { key: 'bush-bunny-right', y: 450 },
    { key: 'bush-small', y: 473 },
    { key: 'bush', y: 467 },
    { key: 'bushes', y: 467 },
    { key: 'mushrooms', y: 467 },
    { key: 'rock', y: 479 },
    { key: 'tree-bush', y: 412 },
    { key: 'trees-rock', y: 403 },
    { key: 'trees', y: 403 },
    { key: 'nothing', y: null }
];
let treeIndexes = [7, 8, 9];

export default class StaticObjects {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Preload images into memory during the Phaser.Scene.preload() call
     */
    loadImages() {
        for (let i = 0; i < staticObjects.length-1; i++) { // ignoring 'nothing'
            this.scene.load.image(staticObjects[i].key, `./assets/imgs/${staticObjects[i].key}.svg`);
        }
    }

    /**
     * Add a random object from our defined dictionary to the scene
     * @param {int} x coordinate for the object to be placed
     */
    addRandomObject(x, ignoreTrees) {
        if (ignoreTrees === undefined) {
            ignoreTrees = false;
        }
        this.scene.obj = this.scene.physics.add.staticGroup();
        let randomIndex = Math.floor(Math.random() * staticObjects.length);
        if (treeIndexes.includes(randomIndex) && ignoreTrees) return; // ignore trees if we need to, e.g. desert level
        let randomObj = staticObjects[randomIndex];
        if (randomObj.key === 'nothing') return; // sometimes we don't want to add an object
        this.scene.obj.create(x, randomObj.y, randomObj.key).refreshBody();
    }
};