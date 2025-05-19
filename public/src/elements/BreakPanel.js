import CountdownPanel from "./CountdownPanel.js";
import eventsCenter from "../eventsCenter.js";

const BREAK_TIME_MS = 120000; // 2 mins
const BREAK_OVER_KEY = 'breakover';

export default class BreakPanel {
    constructor(scene, x, y, width, breakTimeMS = BREAK_TIME_MS) {
        this.scene = scene;
        this.breakTimeMS = breakTimeMS;

        // Register break over event listener
        eventsCenter.once(BREAK_OVER_KEY, () => {
            this.onTimeout();
        });

        // FIXME: Grayed out underlay not extending all the way to the top of the screen
        // - will require fixes to the layout on all devices in order to work properly
        // Add grayed out underlay to the scene
        // this.underlay = scene.add.graphics();
        // this.underlay.fillStyle(0x000000, 1);
        // this.underlay.setAlpha(0.25);
        // this.underlay.fillRect(scene.cameras.main.scrollX, 0, scene.cameras.main.width, scene.cameras.main.height);

        // Main panel background
        this.panelBg = scene.rexUI.add.roundRectangle(x, y, width, 0, { tl: 30, tr: 30, bl: 0, br: 0 }, 0xFFFFFF);

        // Outer vertical container
        this.container = scene.rexUI.add.sizer({
            orientation: 'vertical',
            x,
            y,
            width,
            height: 0,
            space: { top: 30, bottom: 20, left: 25, right: 25, item: 20 }
        });

        // Header row: title + countdown
        const headerRow = scene.rexUI.add.sizer({ orientation: 'horizontal', space: { item: 40 } });

        const titleText = scene.add.text(0, 0, 'Break time', {
            fontSize: '20px',
            fontStyle: 'bold',
            fontFamily: 'DMSans',
            color: '#000000'
        });

        this.countdownPanel = new CountdownPanel(this.scene, 0, 0, this.breakTimeMS, BREAK_OVER_KEY);
        headerRow.add(titleText, { expand: true });
        headerRow.add(this.countdownPanel.container);

        const textPadding = 20;
        const maxWidth = scene.cameras.main.width - (textPadding * 2);

        let breakTextContent = "You\'re doing an amazing job!\nTake a short break if you need one. The task will automatically continue after 2 minutes."

        this.breakText = scene.add.text(scene.cameras.main.scrollX, 0, breakTextContent, {
            fontSize: '14px',
            fontFamily: 'DMSans',
            color: '#000000',
            align: 'center',
            wordWrap: {
                width: maxWidth,
                useAdvancedWrap: true
            },
            fixedWidth: maxWidth
        });

        this.continueButtonBg = scene.rexUI.add.roundRectangle(0, 0, 50, 0, 30, 0xFFFFFF);
        this.continueButtonBg.setStrokeStyle(2, 0xD64204);
        this.continueButtonText = scene.add.text(0, 0, "CONTINUE", {
            fontSize: '14px',
            fontFamily: 'DMSans',
            fontStyle: 'bold',
            color: '#D64204'
        });

        this.continueButton = scene.rexUI.add.label({
            background: this.continueButtonBg,
            text: this.continueButtonText,
            align: 'center',
            height: 48,
            space: { top: 20, bottom: 20, left: 20, right: 20 }
        });

        this.continueButton.setInteractive()
            .on('pointerdown', () => {
                this.continueButtonBg.setFillStyle(0xFEE1D5);
            })
            .on('pointerup', () => {
                this.continueButtonBg.setFillStyle(0xFFFFFF);
                this.onContinuePressed()
            })
            .on('pointerout', () => {
                this.continueButtonBg.setFillStyle(0xFFFFFF);
            });

        const sizer = this.scene.rexUI.add.overlapSizer({
            orientation: 'vertical',
            space: { top: 0, bottom: 20, left: 0, right: 0 }
        });

        // Assemble layout
        this.container.add(headerRow);
        this.container.add(this.breakText, { expand: true });
        this.container.add(this.continueButton, { expand: true });
        this.container.add(sizer);

        this.container.layout();
        this.panelBg.height = this.container.height;
    }

    onContinuePressed() {
        eventsCenter.emit(BREAK_OVER_KEY);
    }

    onTimeout() {
        this.destroy();
    }

    destroy() {
        // Stop the countdown timer
        this.countdownPanel?.destroy();
        // Remove containers from the screen
        this.panelBg?.destroy();
        this.container?.destroy();
        this.underlay?.destroy();
    }
}
