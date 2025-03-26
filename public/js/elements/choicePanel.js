// Displays panel with UI elements for a 2AFC (accept/reject proposed option)

// import our custom events centre for passsing info between scenes
import eventsCenter from '../eventsCenter.js'
import CountdownPanel from './CountdownPanel.js'

// initialize display vars
var backgrCol; var titleCol; var buttonCol;

// make popup dialog box with instructions and choice buttons
export default class ChoicePanel {
    constructor(scene, x, y, trialReward1, trialEffortPropMax1, trialEffort1, trialReward2, trialEffortPropMax2, trialEffort2) {
        this.scene = scene;
        
        // set properties of the panel (text content and colours)    
        var titleTxt = 'Choose a route';
        var mainTxt = ('[color=#FFD700]'+trialReward1+' coins[/color]        '+
                   '[color=#FFD700]'+trialReward2+' coins[/color]\n'+
                   '[color=#FFD700]'+(trialEffortPropMax1*100).toFixed()+'% POWER[/color]      '+        
                   '[color=#FFD700]'+(trialEffortPropMax2*100).toFixed()+'% POWER[/color]');
        
        backgrCol = 0x815532;
        titleCol = 0xf57f17;  
        buttonCol = 0xf57f17;

        this.mainPanel = this.createMainPanel(titleTxt, mainTxt)
            .setPosition(x,y)
            .layout()
            .popUp(750);
            
        // Listen for countdown completion
        eventsCenter.once('countdownComplete', () => {
            this.scene.registry.set('choice', "timeout");
            this.dialog.scaleDownDestroy(250);
            eventsCenter.emit('choiceComplete');
        });
    }

    createMainPanel(titleTxt, mainTxt) {
        // create global registry var to pass choice output between scenes
        this.scene.registry.set('choice', []);
        
        // create components
        this.dialog = this.createDialog(titleTxt, mainTxt);
        var mainPanel = this.scene.rexUI.add.fixWidthSizer({
            orientation: 'x'
            }).add(
                this.dialog,
                0,
                'center',
                0,
                false,
            )
        .layout();
        
        // add some interactivity and ability to save choices
        this.dialog
            .once('button.click', (button) => {
                this.clearTimer();
                let choice = button.text;
                this.scene.registry.set('choice', choice);
                this.dialog.scaleDownDestroy(250);
                eventsCenter.emit('choiceComplete');
            })
            .on('button.over', (button) => {
                button.getElement('background').setStrokeStyle(2, 0xffffff);
            })
            .on('button.out', (button) => {
                button.getElement('background').setStrokeStyle();
            });

        return mainPanel;
    }

    createDialog(titleTxt, mainTxt) {
        // Create the dialog first
        var dialog = this.scene.rexUI.add.dialog({
            background: this.scene.rexUI.add.roundRectangle(0, 0, 150, 500, 20, backgrCol),
            
            title: this.scene.rexUI.add.label({
                background: this.scene.rexUI.add.roundRectangle(0, 0, 25, 40, 20, titleCol),
                text: this.scene.rexUI.add.sizer({
                    orientation: 'horizontal',
                    space: { left: 20, right: 20 }
                })
                .add(
                    this.scene.add.text(0, 0, titleTxt, {
                        fontSize: '20px',
                        color: '#ffffff'
                    }).setOrigin(0.5, 0.5),
                    1, 'center', { left: 80, right: 50 }, true
                )
                .add(
                    new CountdownPanel(this.scene, 0, 0).container,
                    0, 'right', 0, false
                ),
                space: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }),

            content: this.scene.rexUI.add.BBCodeText(0, 0, mainTxt, {
                fontSize: '24px', 
                align: 'center'
            }),

            actions: [
                this.createLabel('route 1'),
                this.createLabel('route 2')
            ],

            space: {
                title: 25,
                content: 20,
                action: 60,
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
            },
            
            align: {
                actions: 'center',
            },

            expand: {
                content: false, 
            }
        })
        .layout();

        this.dialog = dialog;
        
        return dialog;
    }

    createLabel(text) {
        return this.scene.rexUI.add.label({
            background: this.scene.rexUI.add.roundRectangle(0, 0, 50, 50, 20, buttonCol),
            text: this.scene.add.text(0, 0, text, {
                fontSize: '20px',
                //font: '18px monospace',
            }),
            align: 'center',
            width: 80,
            height: 100,
            space: {
                left: 15,
                right: 15,
                top: 20,
                bottom: 5
            }
        });
    }
}
