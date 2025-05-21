import CountdownPanel from "./CountdownPanel.js";
import eventsCenter from "../eventsCenter.js";
import PowerMeterBar from "./PowerMeterBar.js";

const POWER_UP_TIMEOUT_KEY = 'powerUpTimeout';
export const POWER_UP_COMPLETE_KEY = 'powerUpComplete';
export const PRACTICE_POWER_UP_COMPLETE_KEY = 'practicePowerUpComplete';

export default class PowerPanel {
    constructor(scene, x, timeLimit, rewardCoins, power, trialEffort, isPractice = false) {
        this.scene = scene;
        this.powerPercent = 0;
        this.powerText = (power * 100).toFixed();
        this.rewardCoins = rewardCoins;
        this.trialEffort = trialEffort; // number of presses needed to succeed
        this.isPractice = isPractice;

        // Stats to keep track of
        this.pressCount = 0;
        this.pressTimes = [];
        this.timeLeft = timeLimit;

        let y = 0; // This coordinate will be calculated after the panel height is calculated
        let width = window.innerWidth;
        let height = 0; // the height for the panel background will be calculated after the rest of the layout is done

        // Main panel background
        this.panelBg = scene.rexUI.add.roundRectangle(x, y, width, height, { tl: 30, tr: 30, bl: 0, br: 0 }, 0xFFFFFF)
            .setStrokeStyle(2, 0xffffff) // just to ensure that the entire panel is covering the game window width
            .setOrigin(0.5);

        // Outer vertical container
        this.container = scene.rexUI.add.sizer({
            orientation: 'vertical',
            x,
            y,
            width,
            height,
            space: { top: 20, bottom: 20, left: 25, right: 25, item: 20 }
        });

        const powerPanelState = Object.freeze({
            ready: 'READY',
            power: 'POWER',
        })

        this.state = isPractice ? powerPanelState.ready : powerPanelState.power;

        // Header row: title + countdown
        const headerRow = scene.rexUI.add.sizer({ orientation: 'horizontal', space: { item: 40 } });

        const titleText = scene.add.text(0, 0, 'Tap for power', {
            fontSize: '20px',
            fontFamily: 'DMSans',
            fontStyle: 'bold',
            color: '#000000'
        });

        this.countdownPanel = new CountdownPanel(this.scene, 0, 0, 10000, POWER_UP_TIMEOUT_KEY, !isPractice);
        headerRow.add(titleText, { expand: true });
        headerRow.add(this.countdownPanel.container);

        // Power meter background
        const meterBg = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0xF6F8F9);

        // Power meter + coin section
        const maxTotalBlocks = 10;
        const totalBlocks = (maxTotalBlocks * power).toFixed(); // 10 * 0.4 = 4 blocks
        const meterInfoColPadding = 180;
         // Determine maximum width based on screen width - approximate size of paddings and meter info column
        const powerMeterBarMaxWidth = (window.innerWidth - meterInfoColPadding).toFixed();
        const blockWidth = (powerMeterBarMaxWidth / totalBlocks).toFixed();
        this.powerMeter = new PowerMeterBar(this.scene, 0, {
            totalBlocks: totalBlocks,
            blockWidth: blockWidth,
            blockHeight: 60,
            cornerRadius: 4
        });

        this.percentageText = scene.add.text(0, 0, `${this.powerText}%`, {
            fontSize: '20px',
            fontFamily: 'DMSans',
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
        let initialBackgroundColor = this.state ==  powerPanelState.power ? 0xD64204 : 0xFFFFFF; 
        let initialText = this.state == powerPanelState.power ? 'POWER' : 'READY';
        let initialTextColor = this.state == powerPanelState.power ? '#FFFFFF' : '#D64204'

        this.powerButtonBg = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, initialBackgroundColor);
        this.powerButtonBg.setStrokeStyle(2, 0xD64204);
        this.powerButtonText = scene.add.text(0, 0, initialText, {
            fontSize: '18px',
            fontFamily: 'DMSans',
            fontStyle: 'bold',
            color: initialTextColor
        });

        this.powerButton = scene.rexUI.add.label({
            background: this.powerButtonBg,
            text: this.powerButtonText,
            align: 'center',
            height: 100,
            space: { top: 20, bottom: 20, left: 20, right: 20 }
        });

        this.powerButton.setInteractive()
            .on('pointerdown', () => {
                switch(this.state) {
                    case powerPanelState.ready:
                        this.powerButtonBg.setFillStyle(0xFEE1D5);
                        break;
                    
                    case powerPanelState.power:
                        // Only show pressed colour if the user has not yet reached the goal
                        if (this.pressCount < this.trialEffort) {
                            this.powerButtonBg.setStrokeStyle(2, 0x8A2A03);
                            this.powerButtonBg.setFillStyle(0x8A2A03); // Pressed color
                        }
                        break;
                } 
            })
            .on('pointerup', () => {
                switch(this.state) {
                    case powerPanelState.ready:
                        // update the button styling to be the power button
                        this.powerButtonBg.setStrokeStyle(2, 0xD64204);
                        this.powerButtonBg.setFillStyle(0xD64204);
                        this.powerButtonText.setText('POWER');
                        this.powerButtonText.setColor('#FFFFFF');
                        this.state = powerPanelState.power;
                        eventsCenter.emit('powerStatePassed');
                        setTimeout(() => { 
                            this.countdownPanel.startCountdown();
                        }, 500)
                        break;
                    
                    case powerPanelState.power:
                        this.powerButtonBg.setStrokeStyle(2, 0xD64204);
                        this.powerButtonBg.setFillStyle(0xD64204); // Normal color
                        // User has not yet reached the goal so we can safely increment the count
                        if (this.pressCount < this.trialEffort) {
                            this.incrementPower();
                        }
                        // User has reached the goal
                        if (this.pressCount >= this.trialEffort) {
                            this.countdownPanel?.destroy(); // immediately stop and remove the timer
                            this.onSuccess();
                        }
                        break;
                } 
            })
            .on('pointerout', () => {
                switch(this.state) {
                    case powerPanelState.ready:
                        this.powerButtonBg.setFillStyle(0xFFFFFF); // Restore if dragged out
                        break;

                    case powerPanelState.power:
                        this.powerButtonBg.setStrokeStyle(2, 0xD64204);
                        this.powerButtonBg.setFillStyle(0xD64204); // Restore if dragged out
                        break;
                }

            });

        // Assemble layout
        this.container.add(headerRow);
        this.container.add(meterContainer, { expand: true });
        this.container.add(this.powerButton, { expand: true });

        this.container.layout();

        this.panelBg.height = this.container.height;
        this.container.y = window.innerHeight - this.panelBg.height / 2;
        this.panelBg.y = window.innerHeight - this.panelBg.height / 2;

        // Ran out of time to reach the trialEffort
        eventsCenter.once(POWER_UP_TIMEOUT_KEY, () => {
            this.onTimeout();
        });
    }

    incrementPower() {
        this.pressCount++;
        this.pressTimes.push(Math.round(this.scene.time.now));
        this.powerMeter.updatePowerBar(this.pressCount, this.trialEffort);
    }

    onTimeout() {
        this.onComplete();
        this.destroy();
    }

    onSuccess() {
        this.onComplete();
        setTimeout(() => { this.destroy(); }, 200); // Keep the panel visible for a brief moment
    }

    onComplete() {
        this.scene.registry.set('pressCount', this.pressCount);
        this.scene.registry.set('pressTimes', this.pressTimes);
        if (this.isPractice) {
            eventsCenter.emit(PRACTICE_POWER_UP_COMPLETE_KEY); // TODO: Not currently used by the practiceTask
        } else {
            eventsCenter.emit(POWER_UP_COMPLETE_KEY);
        }
        // Stop listening to this registered event
        eventsCenter.removeListener(POWER_UP_TIMEOUT_KEY);
    }

    destroy() {
        // Stop the countdown timer
        this.countdownPanel?.destroy();
        // Remove containers from the screen
        this.panelBg?.destroy();
        this.container?.destroy();
    }
}
