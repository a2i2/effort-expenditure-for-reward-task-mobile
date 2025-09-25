import CountdownPanel from "./CountdownPanel.js";
import eventsCenter from "../eventsCenter.js";

export const TIMER_EXPIRED_KEY = 'bottomPanelTimerExpired';
export const BREAK_TAG = 'bottomScreenBreak';
export const TIMEOUT_TAG = 'bottomScreenTimeout';
export const ARE_YOU_THERE_TAG = 'bottomScreenAreYouThere';
export const EXIT_TASK_TAG = 'bottomScreenExitTask';
export const GAME_COMPLETE_TAG = 'bottomScreenGameComplete';
export const TASK_INTERRUPTED_TAG = 'bottomScreenTaskInterrupted';

export default class BottomScreenPanel {
    constructor(scene, x, titleString, subtitleString, bottomButtonString, breakTimeMS, tag, onContinuePressed = () => {}, onTimeout = () => {}) {
        this.scene = scene;
        this.breakTimeMS = breakTimeMS;
        this.onTimeout = onTimeout;
        this.tag = tag;

        let y = 0; // This coordinate will be calculated after the panel height is calculated
        let width = window.innerWidth;

        // Register break over event listener
        eventsCenter.once(TIMER_EXPIRED_KEY, () => {
            this.onTimerExpired();
        });

        // Main panel background
        this.panelBg = scene.rexUI.add.roundRectangle(x, y, width, 0, { tl: 30, tr: 30, bl: 0, br: 0 }, 0xFFFFFF);

        // Outer vertical container
        this.container = scene.rexUI.add.sizer({
            orientation: 'vertical',
            x,
            y,
            width,
            height: 0,
            space: { top: 30, bottom: 35, left: 25, right: 25, item: 20 }
        });

        // Header row: title + countdown
        const headerRow = scene.rexUI.add.sizer({ orientation: 'horizontal', space: { item: 40 } });

        const titleText = scene.add.text(0, 0, titleString, {
            fontSize: '20px',
            fontStyle: 'bold',
            fontFamily: 'DMSans',
            color: '#000000'
        });

        headerRow.add(titleText, { expand: true });

        // add in the countdown panel if we've defined a timeout
        if (breakTimeMS != null) {
            this.countdownPanel = new CountdownPanel(this.scene, 0, 0, this.breakTimeMS, TIMER_EXPIRED_KEY);
            headerRow.add(this.countdownPanel.container);
        }

        const textPadding = 20;
        const maxWidth = scene.cameras.main.width - (textPadding * 2);

        this.breakText = scene.add.text(scene.cameras.main.scrollX, 0, subtitleString, {
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
        this.continueButtonText = scene.add.text(0, 0, bottomButtonString, {
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
                onContinuePressed()
            })
            .on('pointerout', () => {
                this.continueButtonBg.setFillStyle(0xFFFFFF);
            });

        // Assemble layout
        this.container.add(headerRow);
        this.container.add(this.breakText, { expand: true });
        this.container.add(this.continueButton, { expand: true });

        this.container.layout();
        this.panelBg.height = this.container.height;
        // Position at the bottom of the screen
        this.container.y = window.innerHeight - this.panelBg.height / 2;
        this.panelBg.y = window.innerHeight - this.panelBg.height / 2;
    }

    onTimerExpired() {
        this.destroy();
        this.onTimeout();
    }

    destroy() {
        // Stop the countdown timer
        this.countdownPanel?.destroy();
        // Remove containers from the screen
        this.panelBg?.destroy();
        this.container?.destroy();
        this.underlay?.destroy();
        eventsCenter.removeAllListeners();
    }
}
