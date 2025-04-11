
export default class PowerMeterBar {
    constructor(scene, powerPercent, config = {}) {
        this.scene = scene;

        this.config = {
            totalBlocks: 10,
            blockWidth: 5,
            blockHeight: 14,
            cornerRadius: 1,
            itemSpace: 2,
            ...config
         };

        this.container = this.scene.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: this.config.itemSpace },
            align: 'center'
        });

        const filledBlocks = Math.round((powerPercent / 100) * this.config.totalBlocks);

        for (let i = 0; i < this.config.totalBlocks; i++) {
            const color = i < filledBlocks ? 0x25D070 : 0xD0D5DD;

            const block = this.scene.rexUI.add.roundRectangle(
                0, 0,
                this.config.blockWidth, this.config.blockHeight,
                this.config.cornerRadius,
                color
            );

            this.container.add(block);
        }
    }
}