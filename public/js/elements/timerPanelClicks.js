// Displays panel with a countdown timer and button click input for participant to attempt trial effort

// import our custom events centre for passsing info between scenes
import eventsCenter from '../eventsCenter.js'
import { powerupDelay } from '../versionInfo.js'

// initiliaze timer variables
var timedEvent;
var timedEvent2;

export default class TimerPanel {
    constructor(scene, x, y, timeLimit, trialEffort, practiceOrReal, coundownDelay = powerupDelay) {
        this.scene = scene; 
        
        // initialize time left and press count variables (attach to scene to pass between elements)
        scene.pressCount = 0;
        scene.pressTimes = [];
        scene.timeLeft = timeLimit;

        // setup scene text
        var titleText = 'Power up!';
        var buttonText = 'POWER';
        var timeText;
        
        // set main text depending if practice (callibration) or real (main task) trial
        if (practiceOrReal == 0 ) {
            timeText = ('Press the POWER button!\n\n'+
                        'Time left: '+(scene.timeLeft/1000).toFixed(2)+' seconds');
            var backgrCol =  0x9c73ae;
        } else {
            timeText = ('Press the POWER button!\n\n'+
                        'Time left: '+(scene.timeLeft/1000).toFixed(2)+' seconds');
            var backgrCol = 0x2F4F4F;
        }
        // initilize progress bar (full width)
        scene.fullWidth = 300;
        
        // create main panel (dialog box with text + countdown timer + interactive button + effort progress bar)
        var mainPanel = createMainPanel(scene, titleText, timeText, buttonText, trialEffort, backgrCol, practiceOrReal)
        .setPosition(x,y)
        .layout()
        //.drawBounds(scene.add.graphics(), 0xff0000)   // for debugging only
        .popUp(500); 
        
        setTimeout(() => {
            // every 200ms call updateTimer function (to update 'time left' text in panel)
            const timerDelay = 200;    
            const timerRepeat = (timeLimit / timerDelay) - 1;
            
            timedEvent = scene.time.addEvent({ 
                delay: timerDelay, 
                callback: updateTimer, 
                args: [
                    scene, 
                    trialEffort, 
                    timeText, 
                    timeLimit, 
                    timerDelay, 
                    mainPanel, 
                    practiceOrReal
                ],
                callbackScope: this, 
                repeat: timerRepeat 
            });
        
            // and at end of time limit call endTimer function (to end timer panel scene)
            timedEvent2 = scene.time.addEvent({ 
                delay: timeLimit, 
                callback: endTimer, 
                args: [scene, mainPanel, practiceOrReal],
                callbackScope: this 
            }); 
        }, coundownDelay);
    }
    
   update() { }
}

////////////////////functions to be called by timer elements////////////////////////
var updateTimer = function(scene, trialEffort, timeText, timeLimit, timerDelay, mainPanel, practiceOrReal) {
    // update timer text
    scene.timeLeft -= timerDelay;
    timeText = ('Press the POWER button!\n\n'+
        'Time left: ' + (scene.timeLeft / 1000).toFixed(2) + ' seconds');
    // edit: progressbar above flips the indices (24 March 2023)
    // progressbar above is easier to see for player 
    mainPanel.children[1].children[1].setText(timeText);           // = mainPanel.progressBar (update the progress bar)
    // update effort progress bar
    mainPanel.children[0].setValue(scene.pressCount / trialEffort);  // = mainPanel.dialog.text (when dialog has no title)

    // also end trial if press count hit
    if (scene.pressCount >= trialEffort) {
        scene.time.addEvent({ delay: 50, // add a tiny delay so we get to see progress bar is full
                             callback: function(){ timedEvent.remove(false);    // have to stop timers first else they will try to update things that no longer exist
                                                   timedEvent2.remove(false);
                                                    //endTimer(scene, mainPanel, practiceOrReal);
                                                    // log final press count
                                                    scene.registry.set('pressCount', scene.pressCount); 
                                                    scene.registry.set('pressTimes', scene.pressTimes); 
                                                    // destroy timer panel element
                                                    if (practiceOrReal == 0 ) {
                                                        eventsCenter.emit('practicetimesup'); 
                                                        mainPanel.scaleDownDestroy(100);
                                                    } else {
                                                        eventsCenter.emit('timesup'); 
                                                        mainPanel.scaleDownDestroy(100);
                                                    }
                                                   },  // then end early
                             args: [scene, mainPanel, practiceOrReal],                    
                             callbackScope: this});
    }
}

var endTimer = function(scene, mainPanel, practiceOrReal) {
    // log final press count
    scene.registry.set('pressCount', scene.pressCount); 
    scene.registry.set('pressTimes', scene.pressTimes); 
    // destroy timer panel element
    if (practiceOrReal == 0 ) {
        eventsCenter.emit('practicetimesup'); 
        mainPanel.scaleDownDestroy(100);
    } else {
        eventsCenter.emit('timesup'); 
        mainPanel.scaleDownDestroy(100);
    }
}

////////////////////functions for making in-scene graphics//////////////////////////
///////////main panel////////////
var createMainPanel = function (scene, titleText, timeText, buttonText, trialEffort, backgrCol, practiceOrReal) {
    // create individual components
    var dialog = createDialog(scene, titleText, timeText, buttonText, backgrCol);    // text + timer text + button
    var progressBar = createProgressBar(scene, trialEffort, backgrCol);              // effort progress bar

    var startX = progressBar.x;
    // Create contains to hold the lightning bolt images
    var containerLeft= scene.add.container(0, 0);
    var containerRight = scene.add.container(0, 0);

    // initialise the images:
    // manually set x-cordinate may need checking (not ideal)
    if (practiceOrReal == 0) {
        var powerImageOFF = scene.add.image(-230, 0, 'powerOFFprac');
        var powerImageON = scene.add.image(0, 0, 'powerONprac');
    }
    else {
        var powerImageOFF = scene.add.image(-230, 0, 'powerOFF');
        var powerImageON = scene.add.image(0, 0, 'powerON');

    }
    powerImageOFF.setOrigin(0.5, 0).setScale(0.35);           // Set the image origin and scale
    powerImageON.setOrigin(0.5, 0).setScale(0.35); // make it half size
    // Add the images to their container
    containerLeft.add(powerImageOFF);
    containerRight.add(powerImageON);

    // Add the containers to the progress bar
    progressBar.add(containerLeft,
        0,
        'centre',
        { top: 0, bottom: 30, left: 0, right: 0 });

    progressBar.add(containerRight,
        0,
        'centre',
        { top: 0, bottom: 30, left: 18, right: 0});

    // lay out together using a Sizer
    var mainPanel = scene.rexUI.add.fixWidthSizer({
        orientation: 'x' //'y' // x=vertical stacking, y=horizontal stacking
        }).add(
            progressBar, // child
            0, // proportion
            'left', // align
            0, // paddingConfig
            false, // expand
        ).add(
            dialog, // child
            0, // proportion
            'left', // align
            0, // paddingConfig
            false, // expand
        )
    .layout();
    
    // add button visual functionality
    dialog
        .on('button.over', function (button, groupName, index, pointer) {
            button.getElement('background').setStrokeStyle(2, 0xffffff);           // when hover
        })
        .on('button.out', function (button, groupName, index) {
            button.getElement('background').setStrokeStyle();   // when un-hover
        });

    return mainPanel;
};

///////////popup dialog box/////////
var createDialog = function (scene, titleText, mainText, buttonText, backgrCol) {
    var textbox = scene.rexUI.add.dialog({
        background: scene.rexUI.add.roundRectangle(0, 0, 200, 800,0, backgrCol), 
        content: scene.rexUI.add.BBCodeText(0, 0, mainText, {fontSize: '20px', align: 'center'}),
        space: {
            content: 30, 
            action: 20, 
            left: 10,
            right: 10,
            top: 15,
            bottom: 30,
        },
        actions: [
            createButton(scene, buttonText)
        ],    
        align: {
            actions: 'center',
        },
        expand: {
            content: false
        }
        })
    .layout();
    
    return textbox;
};

/////////interactive button///////////
var createButton = function (scene, text) {
    var btn = scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, undefined, 100, 20, 0xe45404),  // circle
        text: scene.add.text(0, 0, text, {
            fontSize: '24px'
        }),
        align: 'center',
        width: 200,
        space: {
            left: 10, right: 10, top: 40, bottom: 40
        }
    })
    .layout();
    
    // make interactive, record press count and press times
    btn.setInteractive({
        hitArea: new Phaser.Geom.Circle(0, 0, 200),     // set a circular 'hittable area over button'
        hitAreaCallback: Phaser.Geom.Circle.Contains,    // for greater tolerance on region of button pushing
        useHandCursor: true})
        .on('pointerdown', () => { scene.pressCount +=1; 
                                   scene.pressTimes.push(Math.round(scene.time.now)); });

//    // tween (pulse in size)  [looks weird]
//    scene.tweens.add({
//            targets: btn.getElement('background'),
//            radius: '+=10', // 
//            ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
//            duration: 1000,
//            repeat: -1, // -1: infinity
//            yoyo: true
//        });
    
    return btn;
};

////////animated progress bar/////////
var createProgressBar = function(scene, trialEffort, backgrCol){
    var progressBar = scene.rexUI.add.numberBar({ 
        width: scene.cameras.main.width * 0.73,
        orientation: 'horizontal', //'vertical'
        //anchor: {bottom: 'top'},
        // made it a full rectangle instead 
        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, backgrCol),
        //removes icon 24 March 2023 

        slider: {
            track: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 7.5, 0x7b8185),
            indicator: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0xe45404),
            input: 'none',
        },

        space: {
            left: 40,
            right: 40,
            top: 10,
            bottom: 10,
            icon: 0,
            slider: 10,
        },
        
        // text: scene.rexUI.add.BBCodeText(0, 0, '', {
        //     fontSize: '20px', fixedWidth: 50, fixedHeight: 45,
        //      valign: 'center', halign: 'center'//, color: '#e45404'
        // }),
        //
        // valuechangeCallback: function (newValue, oldValue, progressBar, trialEffort) {
        //     progressBar.text = (Math.round(newValue*100))+'%';
        // } 
    })
    .setValue(0, 0, 1)  // initialize value at 0, on scale from 0 to 1
    .layout();
    
    return progressBar;
};

    

