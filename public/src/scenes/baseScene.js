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

    // function to make coin sprites disappear upon contact with player
    // (so player appears to 'collect' them)
    collectCoins(player, coin) {
        coin.disableBody(true, true);      // individual coins from physics group become invisible upon overlap
    }

    // helper: collect coins individually when player passes their x position
    collectCoinsPassedInGroup(group) {
        if (!group || !group.children || !this?.player?.sprite) {
            return;
        }
        const playerX = this.player.sprite.x;

        group.children.iterate((child) => {
            if (!child) {
                return;
            }
            if (child.active && child.visible && typeof child.x === 'number' && playerX >= child.x) {
                this.collectCoins(null, child);
            }
        });
    }

    // Detects if the player has passes by coins on the selected route. If the coins are still visible then they are auto-collected
    autoCollectCoinsIfRequired() {
        if (this.player?.sprite?.x != null && this.player.sprite.anims?.currentAnim?.key == 'float') {
            // determine which route was selected for this trial
            const chosenRoute = this.registry.get('choice');

            if (this.coins1?.sprite && chosenRoute === 'route 1') {
                // top route coins: collect individually as player passes each coin
                this.collectCoinsPassedInGroup(this.coins1.sprite);
            } else if (this.coins2?.sprite && chosenRoute === 'route 2') {
                // bottom route coins: collect individually as player passes each coin
                this.collectCoinsPassedInGroup(this.coins2.sprite);
            }
        }
    }
} 