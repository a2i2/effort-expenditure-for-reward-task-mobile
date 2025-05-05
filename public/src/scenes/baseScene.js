export class BaseScene extends Phaser.Scene {
    constructor(key) {
        super(key);
    }

    /**
     * Launch the next scene defined in the game scene array.
     */
    launchNextScene() {
        const scenes = this.game.scene.scenes;
        const currentIndex = scenes.findIndex(scene => scene.scene.key === this.scene.key);

        if (currentIndex !== -1 && currentIndex < scenes.length - 1) {
            const nextSceneKey = scenes[currentIndex + 1].scene.key;
            this.scene.start(nextSceneKey);
        }
    }
} 