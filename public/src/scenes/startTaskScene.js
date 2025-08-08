import { BaseScene } from "./baseScene.js";
import CloseMessage from "../embedContext/CloseMessage.js";
import GameCache from "../embedContext/GameCache.js";

export const ENTRY_POINT_PRACTICE = "entryPointPractice";

export default class StartTaskScene extends BaseScene {
    static entryPoint = null;

    constructor() {
        super({
            key: 'StartTaskScene'
        });
    }

    preload() {
        this.load.image('close', './src/assets/imgs/close.svg');
        this.load.image('image', './src/assets/imgs/eefrt-start.svg');
    }
    
    create() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        const maxWidth = width - 50; // Width - padding 25px left and right
        const panelHeight = height - 100;
        const panelX = width / 2;
        const panelY = height - panelHeight / 2;

        // Panel background
        this.rexUI.add.roundRectangle(
            panelX,
            panelY,
            width,
            panelHeight,
            { tl: 30, tr: 30, bl: 0, br: 0 },
            0xffffff,
            1.0 // alpha
        );

        const insetTop = EmbedContext.getInsetTop();
        this.closeButton = this.add.image(width - 24, insetTop + 5, 'close');
        this.closeButton.setScrollFactor(0);
        this.closeButton.setInteractive();
        this.closeButton.on('pointerup', () => {
            let closeMessage = new CloseMessage(false, false, false);
            EmbedContext.sendMessage('close', closeMessage.stringify());
        });

        const container = this.rexUI.add.sizer({
            orientation: 'y',
            x: width / 2,
            y: panelY,
            width: maxWidth,
            height: panelHeight,
            space: { top: 35, bottom: 35, item: 20 }
        });

        // default text for first attempt
        var titleText = "Let's get started!";
        var subtitleText = "Nice work! You are now ready to start the main part of the game.\n\nFrom now on, every coin you collect matters – good luck!";

        let cache = GameCache.cache;
        if (cache != null && cache.attemptCount > 1 && StartTaskScene.entryPoint == ENTRY_POINT_PRACTICE) {
            // if the user triggers 2A, they will return from the practice trials so we can show this specific message.
            subtitleText = "Nice work! You are now ready to start the main part of the game.\n\nThis is your second attempt and any further interruptions may invalidate your opportunity to complete this task.";
        } else if (cache != null && cache.attemptCount > 1 && StartTaskScene.entryPoint != ENTRY_POINT_PRACTICE) {
            // if there is no entry point defined then we can assume the user will resume from the main trials.
            titleText = "Let's continue!"
            subtitleText = "Welcome back! You can continue where you left off, but any further interruptions may invalidate your opportunity to win any coins.";
        }

        // Title
        const title = this.add.text(0, 0, titleText, {
            fontSize: '18px',
            fontFamily: 'DMSans',
            color: '#000'
        });

        const imageKey = 'image'; // Change as needed
        
        // Get natural size of image
        const frame = this.textures.get(imageKey).getSourceImage();
        const imageNaturalWidth = frame.width;
        const imageNaturalHeight = frame.height;
        const aspectRatio = imageNaturalHeight / imageNaturalWidth;
        
        // Calculate scaled dimensions
        const displayWidth = Math.min(maxWidth, imageNaturalWidth);
        const displayHeight = displayWidth * aspectRatio;
        
        // Add the image with dynamic size
        const image = this.add.image(0, 0, imageKey)
            .setDisplaySize(displayWidth, displayHeight);

        // Description
        const descText = this.add.text(0, 0, subtitleText, {
            fontSize: '16px',
            fontFamily: 'DMSans',
            color: '#404040',
            lineSpacing: 4,
            wordWrap: { width: maxWidth }
        });

        // Get Started Button
        const buttonBackground = this.rexUI.add.roundRectangle(0, 0, 0, 0, 30, 0xFFFFFF);
        buttonBackground.setStrokeStyle(2, 0xD64204);
        const buttonText = this.add.text(0, 0, 'GET STARTED', {
            fontSize: '14px',
            color: '#D64204',
            fontFamily: 'DMSans',
            fontStyle: 'bold'
        });
        const button = this.rexUI.add.label({
            width: maxWidth,
            height: 60,
            background: buttonBackground,
            text: buttonText,
            align: 'center'
        })
        .setInteractive()
        .on('pointerdown', () => {
            buttonBackground.setFillStyle(0xFEE1D5);
        })
        .on('pointerup', () => {
            buttonBackground.setFillStyle(0xFFFFFF);
            this.launchNextScene();
        })
        .on('pointerout', () => {
            buttonBackground.setFillStyle(0xFFFFFF);
        });

        // Build layout
        container
            .add(title, 0, 'left')
            .add(image, 0, 'center')
            .add(descText, 0, 'center')
            .addSpace()  // Push button to bottom
            .add(button, 0, 'center');

        // Final layout
        container.layout();
    }
    
    update(time, delta) {
    }
}