import PowerMeterBar from "./PowerMeterBar.js";

export default class PowerPanel {
    constructor(scene, x, y, width, height, timeLimit, rewardCoins, power, trialEffort) {
        this.scene = scene;
        this.powerPercent = 0;
        this.powerText = (power * 100).toFixed();
        this.rewardCoins = rewardCoins;
        this.trialEffort = trialEffort; // number of presses needed to succeed

        // Stats to keep track of
        this.pressCount = 0;
        this.pressTimes = [];
        this.timeLeft = timeLimit;

        // Main panel background
        this.panelBg = scene.rexUI.add.roundRectangle(x, y, width, height, { tl: 30, tr: 30, bl: 0, br: 0 }, 0xffffff).setStrokeStyle(1, 0xeeeeee);

        // Outer vertical container
        this.container = scene.rexUI.add.sizer({
            orientation: 'vertical',
            x,
            y,
            width,
            height,
            space: { top: 20, bottom: 20, left: 25, right: 25, item: 20 }
        });

        // Header row: title + countdown
        const headerRow = scene.rexUI.add.sizer({ orientation: 'horizontal', space: { item: 10 } });

        const titleText = scene.add.text(0, 0, 'Tap for power', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#000000'
        });

        this.timerText = scene.add.text(0, 0, '⏱️ 0:10', {
            fontSize: '16px',
            color: '#666'
        });

        headerRow.add(titleText, { expand: true });
        headerRow.add(this.timerText);

        // Power meter background
        const meterBg = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0xF6F8F9);

        // Power meter + coin section
        const maxTotalBlocks = 10;
        const maxBlockWidth = 25;
        this.powerMeter = new PowerMeterBar(this.scene, 0, {
            totalBlocks: (maxTotalBlocks * power).toFixed(), // 10 * 0.4 = 4 blocks
            blockWidth: (maxBlockWidth / power).toFixed(), // 25 / 0.4 = 62.5 width (less blocks means wider width)
            blockHeight: 60,
            cornerRadius: 4
        });

        this.percentageText = scene.add.text(0, 0, `${this.powerText}%`, {
            fontSize: '20px',
            color: '#999',
        });

        const coinImageSizes = [
            { width:24 },
            { width:30 },
            { width:36 },
            { width:42 },
            { width:48 },
            { width:54 },
            { width:60 },
        ];
        const coinWidth = coinImageSizes[rewardCoins  -  1].width;
        this.coinIcon = scene.add.image(0, 0, `coins-${rewardCoins}`).setDisplaySize(coinWidth, 24);

        const meterInfoColumn = scene.rexUI.add.sizer({
            orientation: 'vertical',
            align: 'center',
            space: { item: 8 }
        });

        meterInfoColumn.add(this.percentageText);
        meterInfoColumn.add(this.coinIcon);

        const meterColumn = scene.rexUI.add.sizer({
            orientation: 'vertical',
            align: 'center'
        });

        const meterRow = scene.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 20 }
        });
        meterRow.add(this.powerMeter.container);
        meterRow.add(meterInfoColumn);

        meterColumn.add(meterRow);

        const padding = 20;
        const meterContainer = scene.rexUI.add.overlapSizer({ 
            space: { top: padding, bottom: padding, left: padding, right: padding }
        });
        meterContainer.addBackground(meterBg);
        meterContainer.add(meterColumn);

        // POWER button
        const powerButtonBg = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0xD64204);
        const powerButtonText = scene.add.text(0, 0, 'POWER', {
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        });

        const powerButton = scene.rexUI.add.label({
            background: powerButtonBg,
            text: powerButtonText,
            align: 'center',
            height: 100,
            space: { top: 20, bottom: 20, left: 20, right: 20 }
        });

        powerButton.setInteractive()
            .on('pointerdown', () => {
                powerButtonBg.setFillStyle(0x8A2A03); // Pressed color
                this.increasePowerMeter();
            })
            .on('pointerup', () => {
                powerButtonBg.setFillStyle(0xD1440C); // Normal color
            })
            .on('pointerout', () => {
                powerButtonBg.setFillStyle(0xD1440C); // Restore if dragged out
            });

        // Assemble layout
        this.container.add(headerRow);
        this.container.add(meterContainer, { expand: true });
        this.container.add(powerButton, { expand: true });

        this.container.layout();
    }

    increasePowerMeter() {
        this.pressCount++;
        this.pressTimes.push(Math.round(this.scene.time.now));
        this.powerMeter.updatePowerBar(this.pressCount, this.trialEffort);
    }

    getContainer() {
        return this.container;
    }
}
