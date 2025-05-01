import eventsCenter from '../eventsCenter.js';
import CountdownPanel from './CountdownPanel.js';
import PowerMeterBar from './PowerMeterBar.js';

const ROUTE_TIMEOUT_KEY = 'routeTimeout';

export default class RouteSelectorPanel {
    constructor(scene, x, y, width, height, route1Coins, route1Power, route2Coins, route2Power, onSelect, timeoutMillis = 10000) {
        this.scene = scene;
        this.route1Coins = route1Coins;
        this.route2Coins = route2Coins;
        this.route1Power = (route1Power * 100).toFixed();
        this.route2Power = (route2Power * 100).toFixed();
        this.onSelect = onSelect;

        this.width = width;

        // background panel
        this.panel = scene.rexUI.add.roundRectangle(x, y, width, height, 
            { // rounded corners top
                tl: 30,
                tr: 30,
                bl: 0,
                br: 0
            }, 
            0xffffff // background colour
        )
            .setStrokeStyle(2, 0xffffff) // just to ensure that the entire panel is covering the game window width
            .setOrigin(0.5);

        this.container = scene.rexUI.add.sizer({
            orientation: 'vertical',
            x: x,
            y: y,
            width: width,
            height: height,
            // padding-space, and space between items
            space: { top: 20, bottom: 20, left: 20, right: 20, item: 20 }
        });

        // Header: Title + Timer
        const titleRow = scene.rexUI.add.sizer({ orientation: 'horizontal', space: { item: 40 } });

        const title = scene.add.text(0, 0, 'Choose a route', {
            fontSize: '20px',
            color: '#000',
            fontStyle: 'bold'
            // TODO: Font family
        });

        titleRow.add(title, { expand: true });
        if (timeoutMillis != null) {
            this.countdownPanel = new CountdownPanel(this.scene, 0, 0, timeoutMillis, ROUTE_TIMEOUT_KEY);
            titleRow.add(this.countdownPanel.container);
        }

        this.container.add(titleRow);

        // Buttons
        const optionsRow = scene.rexUI.add.sizer({
            orientation: 'horizontal',
            space: { item: 20 }
        });

        const route1 = this.createRouteButton('Route 1', this.route1Power, this.route1Coins, false);
        const route2 = this.createRouteButton('Route 2', this.route2Power, this.route2Coins, timeoutMillis == null); // only show this one as disabled on the 3rd pracice round where we dont have a timeout defined

        optionsRow.add(route1);
        optionsRow.add(route2);

        this.container.add(optionsRow, { align: 'center' });

        this.container.layout();

        if (timeoutMillis == null) {
            this.overlay = this.scene.add.graphics();

            // for whatever reason the layout engine reports the route 2 x and y values as the centre point of the panel, adjust it so it actually covers the whole choice panel
            let overlayX = route2.x - (route2.width / 2);
            let overlayY = route2.y - (route2.height / 2);

            this.overlay.fillStyle(0x000000, 0.25);
            this.overlay.fillRoundedRect(overlayX, overlayY, route2.width, route2.height, 10);
            this.overlay.lineStyle(5, 0x000000, 0.25);
            this.overlay.fillStyle(0x000000, 0.25);
        }

        // React when the countdown timer has finished
        eventsCenter.once(ROUTE_TIMEOUT_KEY, () => {
            setTimeout(() => {
                this.onSelect?.('timeout');
                this.destroy();
            }, 100);
        });
    }

    createRouteButton(routeName, power, reward, isDisabled) {
        const bg = this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0xFFFFFF).setStrokeStyle(2, 0xD64204);

        const sizer = this.scene.rexUI.add.overlapSizer({
            orientation: 'vertical',
            space: { top: 0, bottom: 20, left: 0, right: 0 }
        });

        const buttonSizer = this.scene.rexUI.add.sizer({ orientation: 'vertical', space: { item: 6 } });

        const padding = 40;
        const titleLabel = this.scene.rexUI.add.label({
            width: this.width / 2 - padding, // total width / 2 panels - some padding
            height: 32,
            background: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, { tl: 10, tr: 10, bl: 0, br: 0 }, 0xD64204),
            text: this.scene.add.text(0, 0, routeName, {
                fontSize: '16px',
                color: '#FFFFFF',
                fontStyle: 'bold'
            }),
            align: 'center',
            space: {
                left: 8,
                right: 8,
                top: 6,
                bottom: 6
            }
        });

        // const powerLabel = this.scene.add.text(0, 0, 'POWER', { fontSize: '16px', color: '#CA3E04' });
        const powerLabel = this.scene.rexUI.add.label({
            text: this.scene.add.text(0, 0, 'POWER', {
                fontSize: '16px',
                color: '#CA3E04'
            }),
            align: 'center',
            space: { left: 6, right: 6, top: 20, bottom: 0 }
        });
        const powerValue = this.scene.add.text(0, 0, `${power}%`, { fontSize: '18px', color: '#000000' });

        // Reward label and value
        const rewardLabel = this.scene.rexUI.add.label({
            text: this.scene.add.text(0, 0, 'REWARD', {
                fontSize: '16px',
                color: '#CA3E04'
            }),
            align: 'center',
            space: { left: 6, right: 6, top: 20, bottom: 0 }
        });

        const rewardValue = this.scene.add.text(0, 0, `${reward} coins`, {
            fontSize: '18px',
            color: '#000000'
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

        // Dynamically select coin image based on reward amount
        const coinKey = `coins-${reward}`; // e.g., coins-7
        const coinWidth = coinImageSizes[reward  -  1].width;
        const coinIcon = this.scene.add.image(0, 0, coinKey).setDisplaySize(coinWidth, 24);

        // Arrange reward text above coin icon
        const rewardColumn = this.scene.rexUI.add.sizer({
            orientation: 'vertical',
            space: { item: 4 },
            align: 'center'
        });
        rewardColumn.add(rewardValue, { align: 'center' });
        rewardColumn.add(coinIcon, { align: 'center' });

        const powerMeter = new PowerMeterBar(this.scene, power).container;

        buttonSizer.add(titleLabel);
        buttonSizer.add(powerLabel);
        buttonSizer.add(powerValue);
        buttonSizer.add(powerMeter, { align: 'center' });
        buttonSizer.add(rewardLabel);
        buttonSizer.add(rewardColumn);

        sizer.addBackground(bg);
        sizer.add(buttonSizer, { align: 'center' });

        if (!isDisabled) {
            sizer.setInteractive()
            // User has dragged/touched their cursor/finger over/onto the button
            .on('pointerover', () => {
                this.clearSelections();
                bg.setFillStyle(0xFEE1D5);
            })
            // User has dragger their cursor/finger off the button
            .on('pointerout', () => {
                this.clearSelections();
            })
            // User has released their cursor/finger to 'confirm' their selection
            .on('pointerup', () => {
                this.clearSelections();
                this.onSelect?.(routeName.toLowerCase());
                this.destroy();
            });

        }
        // Keep track to reset background color
        sizer.__bg__ = bg;

        return sizer;
    }

    clearSelections() {
        this.container.children.forEach(child => {
            if (child.__bg__) {
                child.__bg__.setFillStyle(0xffffff);
            } else if (child.childrenMap) {
                child.children.forEach(grandChild => {
                    if (grandChild.__bg__) {
                        grandChild.__bg__.setFillStyle(0xffffff);
                    }
                });
            }
        });
    }

    getContainer() {
        return this.container;
    }

    destroy() {
        // Stop listening to this registered event
        eventsCenter.removeListener(ROUTE_TIMEOUT_KEY);
        // Stop the countdown timer
        this.countdownPanel?.destroy();
        // Remove containers from the screen
        this.panel?.destroy();
        this.container?.destroy();
        this.overlay?.destroy();
    }
}
