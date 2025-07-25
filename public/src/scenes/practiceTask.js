// Scene to hold the the pre-task practice / effort callibration scene. Routes to the Main Task scene.
import { BaseScene } from "./baseScene.js";

// import js game element modules (sprites, ui, outcome animations, etc.)
import Player from "../elements/player.js";
import Coins from "../elements/coins.js";
import RouteSelectorPanel from "../elements/RouteSelectorPanel.js";
import ProgressBar from "../elements/progressBar.js";
import PowerPanel, { PRACTICE_POWER_UP_COMPLETE_KEY } from "../elements/PowerPanel.js";

// import our custom events center for passsing info between scenes annd relevant data saving function
import eventsCenter from '../eventsCenter.js'

// import effort info from versionInfo file
import { effortTime, pracTrialEfforts, pracTrialRewards, timeout } from "../versionInfo.js";

import Message from "../elements/message.js";
import GameCache from "../embedContext/GameCache.js";
import PracticeTaskAttempt from "../embedContext/PracticeTaskAttempt.js";
import { POWER_COUNTDOWN_KEY } from "../elements/CountdownPanel.js";
import InteruptionsHandler from "../embedContext/InteruptionsHandler.js";
import CloseMessage from "../embedContext/CloseMessage.js";
import BottomScreenPanel from "../elements/BottomScreenPanel.js";
import { EXIT_TASK_TAG } from "../elements/BottomScreenPanel.js"

// initialize some global vars
var gameHeight;
var gameWidth;
var mapWidth;
var mapHeight;
var platforms;
var bridge;
const decisionPointX = 370;    // where the info panel will be triggered (x coord in px)
const midbridgeX = 735;        // where gems will be displayed (x coord in px)
const endbridgeX = 765;        // where the player must jump up to cross bridge (x coord in px)
const playerVelocity = 1000;   // baseline player velocity (rightward)
// initialize practice task vars
var pracTrial = 0;
var nPracTrials = pracTrialRewards.length;
var feedbackMessage;
var pressCount;
var pressTimes;
var trialSuccess;
var maxPressCount;

// set these values to max effort required initially
var selectedEffort = pracTrialEfforts[0];
var selectedReward = pracTrialRewards[0];
var selectedEffortProp = 1.0;

// initiliaze timing and response vars
var pracFeedbackTime = 1500;
var pracAnimationTime = 400;
const practiceOrReal = 0;

let trialReward1 = 7;
let trialEffortPropMax1 = 1;
let trialReward2 = 2;
let trialEffortPropMax2 = 0.4;
let maxEffortPresses = 75;
let minEffortPresses = 30; // 40% of 75

const PRACTICE_TIMEOUT_KEY = 'practiceTimeout';
const PRACTICE_CHOICE_KEY = 'practiceChoiceComplete';

var routeSelectionTransitionTimer;
var smallDeviceOffset = 0;

var powerCountdown;

// this function extends Phaser.Scene and includes the core logic for the game
export default class PracticeTask extends BaseScene {
    constructor() {
        super({
            key: 'PracticeTask'
        });
    }

    preload() {
        // skip the practice task if we've already completed it
        if (GameCache.cache && GameCache.cache.practiceComplete) {
            this.launchNextScene();
            return;
        }

        ////////////////////PRELOAD GAME ASSETS///////////////////////////////////
        // load tilemap and tileset created using Tiled (see below)
        this.load.tilemapTiledJSON('pmap', './src/assets/tilemaps/tilemap-main-grass.json');
        this.load.image('tiles', './src/assets/tilesets/tiles_edited_70px_extruded.png');

        // load player sprite
        this.load.spritesheet('player', './src/assets/spritesheets/player1.png', { 
            frameWidth: 90, 
            frameHeight: 96
        });
        
        this.load.image('chapter-1-1', './src/assets/imgs/chapter-1-1.svg');

        // close button
        this.load.image('close', './src/assets/imgs/close.svg');

        // load spinning coin spritesheet
        this.load.spritesheet('coin', './src/assets/spritesheets/coin.png', {
            frameWidth: 15.8,
            frameHeight: 16
        });

        // load rock and plant sprites to add some texture to background
        this.load.image('smallShrub', './src/assets/imgs/small-shrub.svg');
        this.load.image('cloud', './src/assets/imgs/cloud2.png');
        this.load.image('button', './src/assets/imgs/button.png');
        // lightning bolt power:
        this.load.image('powerOFFprac', './src/assets/imgs/lightning-bolt-80_empty_practice.png')
        this.load.image('powerONprac', './src/assets/imgs/lightning-bolt-80_filled_practice.png')
        this.load.image('powerOFF', './src/assets/imgs/lightning-bolt-80_empty.png')
        this.load.image('powerON', './src/assets/imgs/lightning-bolt-80_filled.png')

        // load animated coin sprite (these will represent offered reward level)
        this.load.spritesheet('gem', './src/assets/spritesheets/crystal-qubodup-ccby3-32-pink.png', { 
            frameWidth: 32, 
            frameHeight: 32
        });

        // load coin images
        for (let i = 1; i <= 7; i++) {
            this.load.image(`coins-${i}`, `./src/assets/imgs/coins-${i}.svg`);
        }
    }
    
    create() {
        // don't bother creating anything if we've already completed practice task, it will be skipped momentarily.
        if (GameCache.cache && GameCache.cache.practiceComplete) {
            return;
        }

        // if we're on a smaller screen we want to shift most of the UI elements up so they are visible
        if (window.innerHeight < 800) {
            smallDeviceOffset = -175;
        }

        this.interruptionExitTaskDialog = false;
        this.bottomScreenPanel = null;

        ////////////////////////CREATE WORLD//////////////////////////////////////
        // game world created in Tiled (https://www.mapeditor.org/)
        // import practice world tilemap
        var pmap = this.make.tilemap({ key: "pmap" });
        var tileset = pmap.addTilesetImage("tiles_edited_70px_extruded", "tiles"); // first arg must be name used for the tileset in Tiled

        // grab some size variables that will be helpful later
        gameHeight = this.sys.game.config.height;
        gameWidth = this.sys.game.config.width;
        mapWidth = pmap.widthInPixels;
        mapHeight = pmap.heightInPixels;

        this.background = this.add.tileSprite(mapWidth/2, mapHeight/2.2 + smallDeviceOffset, 1107, 970, "chapter-1-1");

        // import scene layers (using names set up in Tiled)
        platforms = pmap.createStaticLayer("platforms", tileset, 0, smallDeviceOffset);
        bridge = pmap.createStaticLayer("bridge", tileset, 0, smallDeviceOffset);

        // set up collision property for tiles that can be walked on (set in Tiled)
        platforms.setCollisionByProperty({ collide: true });
        bridge.setCollisionByProperty({ collide: true });

        // add plant sprites for texture (randomly positioned on each trial)
        this.plants = this.physics.add.staticGroup();
        for (var i = 0; i < 2; i++) {
            var x = 25;
            var y = 473;
            this.plants.create(x, y + smallDeviceOffset, 'smallShrub').setScale(1.2).refreshBody();
        }

        // set the boundaries of the world
        this.physics.world.bounds.width = mapWidth;
        this.physics.world.bounds.height = gameHeight;

        //////////////ADD PROGRESS BAR////////////////////
        const insetTop = EmbedContext.getInsetTop();
        // Create progress bar at the top of the screen with nBlocks segments
        this.progressBar = new ProgressBar(this, 24, insetTop, nPracTrials, pracTrial, {
            height: 10,
            padding: 4,
            cornerRadius: 5,
            trialsPerBlock: 1
        });
        // Make it stay fixed on screen (not affected by camera)
        this.progressBar.setScrollFactor(0);

        this.closeButton = this.add.image(gameWidth - 24, insetTop + 5, 'close');
        this.closeButton.setScrollFactor(0);
        this.closeButton.setInteractive();
        this.closeButton.on('pointerdown', () => {
            let closeMessage = new CloseMessage(false, false, false);
            EmbedContext.sendMessage('close', closeMessage.stringify());
        });

        //////////////ADD PLAYER SPRITE////////////////////
        this.player = new Player(this, 0, 300 + smallDeviceOffset); // (this, spawnPoint.x, spawnPoint.y);
        this.physics.add.collider(this.player.sprite, platforms);    // player walks on platforms 
        this.physics.add.collider(this.player.sprite, bridge);       // player walks on platforms and bridge     

        //////////////CONTROL CAMERA///////////////////////
        this.cameras.main.startFollow(this.player.sprite);           // camera follows player
        this.cameras.main.setBounds(0, 0, mapWidth, gameHeight);

        ///////////INSTRUCTIONS & SCORE TEXT///////////////
        //        // add instructions text in a fixed position on the screen
        //        this.add
        //            .text(16, 16, "practice powering up to collect gems!", {
        //                font: "18px monospace",
        //                fill: "#ffffff",
        //                padding: { x: 20, y: 10 },
        //                backgroundColor: "#1ea7e1"
        //            })
        //            .setScrollFactor(0);

        /////////////UI: CHOICES AND RATINGS///////////////
        // UI functionality built using Rex UI plugins for phaser3 
        // (see https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/). 
        // These plugins are globally loaded from the min.js src in index.html

        //////////////////////////TRIAL CONTROL POINTS///////////////////////////
        // 0. First, let's add some invisible to sprites regions of space that key trial 
        // events depend on, so that our player can collide (interact) with them
        // 0.1 point where the choice panel is triggered:
        this.decisionPoint = this.physics.add.sprite(decisionPointX, gameHeight / 2);
        this.decisionPoint.displayHeight = gameHeight;
        this.decisionPoint.immovable = true;
        this.decisionPoint.body.moves = false;
        this.decisionPoint.allowGravity = false;
        // 0.2 end of bridge where our little man requires a gravity boost (reject & unsuccessful trials):
        this.bridgeEndPoint = this.physics.add.sprite(endbridgeX, gameHeight/2);
        this.bridgeEndPoint.displayHeight = gameHeight;  
        this.bridgeEndPoint.immovable = true;
        this.bridgeEndPoint.body.moves = false;
        this.bridgeEndPoint.allowGravity = false;
        // 0.3 point where a new trial is triggered:
        this.trialEndPoint = this.physics.add.sprite(mapWidth - 20, gameHeight / 2);
        this.trialEndPoint.displayHeight = gameHeight;
        this.trialEndPoint.immovable = true;
        this.trialEndPoint.body.moves = false;
        this.trialEndPoint.allowGravity = false;

        // 1. Upon entering scene, player moves right until they encounter the decisionPoint
        this.player.sprite.setVelocityX(playerVelocity * 2.5);  // positive X velocity -> move R
        this.player.sprite.anims.play('run', true);
        this.physics.add.collider(this.player.sprite, this.decisionPoint,
            function () { eventsCenter.emit('infoPanelOn'); }, null, this); // once the player has collided with invisible decision point, emit event
        // once this event is detected, perform the function displayInfoPanel (only once)
        eventsCenter.once('infoPanelOn', displayInfoPanel, this);

        // 2. After trial outcome (reject, accept+successful, accept+unsuccessful), 
        // player moves right again until they encounter the trial end point
        this.physics.add.collider(this.player.sprite, this.trialEndPoint,
            function () { eventsCenter.emit('practiceTrialEndHit'); }, null, this); // once the player has collided with invisible trial end point, emit event
        // once this event us detected, perform the function trialEnd (only once)
        eventsCenter.once('practiceTrialEndHit', pracTrialEnd, this);

        eventsCenter.once(POWER_COUNTDOWN_KEY, storeCountdownStarted, this);

        // // 3. if desired, add listener functions to pause game when focus taken away
        // // from game browser tab/window [necessary for mobile devices]
        // window.addEventListener('blur', () => { 
        // console.log('pausing game content...');      // useful for debugging pause/resume
        //     this.scene.pause();
        // }, false);
        // // // and resume when focus returns
        // window.addEventListener('focus', () => { 
        //     setTimeout(() => {
        //         console.log('resuming game content...');
        //         this.scene.resume();
        //     }, 250);
        // }, false);
    }
    
    update(time, delta) {
        // backup check to skip the practice task already and it wasn't availiable to read during preload
        if (GameCache.cache && GameCache.cache.practiceComplete) {
            console.log("practice task passed");
            this.launchNextScene();
            return;
        }

        let cache = GameCache.cache;
        if (cache && cache.interruptionTimestamp) {
            InteruptionsHandler.handleInteruption(this, cache);
            GameCache.cache.interruptionTimestamp = null; // prevent this from being evaluated in subsequent updates
        }

        ///////////SPRITES THAT REQUIRE TIME-STEP UPDATING FOR ANIMATION//////////
        // allow player to move
        this.player.update(); 
        
        /*
            In the practice trials we use the maxPressCount to determine the maximum effort the user can achieve and calculate
            the required number of presses to complete each trial. In the event the user reaches 80% of the trials completed
            and then returns to the task again we want to use the maxPressCount from the previous iteration of the task.

            Once we complete all 4 practice trials we we want to save the maxPressCount to the cache and the registry so it can be used in the main trials.
        */
        if (pracTrial == nPracTrials) {
            let calibrationComplete = false;
            if (GameCache.cache?.calibrationComplete == true) {
                calibrationComplete = true;
                maxPressCount = GameCache.cache.maxPressCount;
            }

            // signal to the cache that the practice is complete
            let trialSeqFilename = GameCache.cache?.trialSeqFilename || null;
            let cache = new GameCache(true, 0, maxPressCount, 0, {}, null, trialSeqFilename, calibrationComplete, null)
            GameCache.cache = cache;
            EmbedContext.sendMessage('currentGameCache', cache.stringify());

            // progress to the next scene
            this.registry.set('maxPressCount', maxPressCount);
            this.launchNextScene();
        }
    }
}

///////////////////////////////FUNCTIONS FOR CONTROLLING TRIAL SEQUENCE/////////////////////////////////////
// 1. Once player has hit the decision point, pop up the choice panel with info for that trial
var displayInfoPanel = function () {
    // update some stuff (stop player moving and remove decisionPoint sprite)
    this.player.sprite.setVelocityX(0);
    this.player.sprite.anims.play('wait', true); 
    this.decisionPoint.destroy();
    
    // if the user is shown the route selection panel then we will want to show the coins
    if (pracTrial > 1) {
        this.coins1 = new Coins(this, midbridgeX-(trialReward1*65)/2, 235 + smallDeviceOffset, trialReward1); // coins in sky
        this.coins2 = new Coins(this, midbridgeX-(trialReward2*155)/2, 360 + smallDeviceOffset, trialReward2); // coins on bridge
    }

    // each practice trial has a custom message displayed at the same time as the choice panel,
    // work out which one to display based on the practice trial index
    showMessageForCurrentPracticeTrial(this)

    // once choice is entered, get choice info and route to relevant next step
    eventsCenter.once(PRACTICE_CHOICE_KEY, doChoice, this); 

    // listen for the power up timeout event so we can show the fail scene
    eventsCenter.once(PRACTICE_POWER_UP_COMPLETE_KEY, effortOutcome, this) 

    // listen for the timeout event
    eventsCenter.once(PRACTICE_TIMEOUT_KEY, effortOutcome, this);

    // we only want to show the route selector panel for the first two trials 
    if (pracTrial != 0 && pracTrial != 1) {
        const camera = this.cameras.main;
        const centerX = camera.scrollX + camera.width / 2;

        this.instructionsPanel = new RouteSelectorPanel(
            this,
            centerX,
            trialReward1,
            trialEffortPropMax1,
            trialReward2,
            trialEffortPropMax2,
            (selected) => {
                this.registry.set('choice', selected);
                if (selected == 'timeout') {
                    // show the power up fail scene
                    eventsCenter.emit(PRACTICE_TIMEOUT_KEY, this)
                } else {
                    // proceed to the users choice
                    eventsCenter.emit(PRACTICE_CHOICE_KEY);
                }
            },
            pracTrial == 3 ? timeout : null // allow infinite time for the 3rd practice trial and then re-introduce the timeout for the 4th practice
        );
    } else {
        // skip straight to the power up scene
        eventsCenter.emit(PRACTICE_CHOICE_KEY);
    }
};

var showMessageForCurrentPracticeTrial = function (context) {
    let messages = [
        "[b]First, let\'s learn how to fly![/b]\nTap the button as fast as you can to help Pickle fly. Press \'ready\' to start.",
        "[b]Great effort![/b]\nLet's try again - practice makes perfect.",
        "[b]Nice! Now, let\'s learn about routes.[/b]\nRoutes require different amounts of effort and offer different rewards.",
        "[b]Your turn![/b]\nChoose the route you\'d prefer to take. You have 5 seconds.",
    ]

    // remove feedback message from the screen if its still there
    if (feedbackMessage) {
        clearTimeout(routeSelectionTransitionTimer);
        feedbackMessage.destroy();
        feedbackMessage = null;
    }

    let messageTextForCurrentTrial = messages[pracTrial];
    feedbackMessage = new Message(
        context,
        gameWidth,
        0xF6F8F9,
        0xD0D5DD,
        messageTextForCurrentTrial,
        "#000000",
        80
    );

    context.tweens.add({        
        targets: feedbackMessage,
        scaleX: { start: 0, to: 1 },
        scaleY: { start: 0, to: 1 },
        ease: 'Linear',    
        duration: pracAnimationTime,
        repeat: 0,      
        yoyo: false,
        onComplete: () => {
            // for the 3rd practice trial, an addiitonal dialog appears after 5 seconds
            if (pracTrial == 2) {
                routeSelectionTransitionTimer = setTimeout(() => {
                    pracRound3AdditionalDialog(context)
                }, 4600); // 4.6 + 0.4(animation duration) seconds = 5 seconds
            }
        }
    });
};

var pracRound3AdditionalDialog = function(context) {
    clearTimeout(routeSelectionTransitionTimer);

    if (pracTrial != 2) {
        return; // ensure we are updating this dialog only on the 3rd practice trial
    }

    // remove feedback message from the screen if its still there
    if (feedbackMessage) {
        feedbackMessage.destroy();
        feedbackMessage = null;
    }

    let messageTextForCurrentTrial = "[b]Each round you\'ll have 5 seconds to choose a route.[/b]\nFor now, let\'s try Route 1.";
    feedbackMessage = new Message(
        context,
        gameWidth,
        0xF6F8F9,
        0xD0D5DD,
        messageTextForCurrentTrial,
        "#000000",
        80
    );

    context.tweens.add({        
        targets: feedbackMessage,
        scaleX: { start: 0, to: 1 },
        scaleY: { start: 0, to: 1 },
        ease: 'Linear',    
        duration: pracAnimationTime,
        repeat: 0,      
        yoyo: false
    });
}

// 2. Once participant has indicated they are ready, let them try out the effort panel 
var doChoice = function () {
    // the first 2 trials we assume the max effrort, the last 2 are driven by user choice
    if (pracTrial < 2) {
        selectedEffort = maxEffortPresses;
        selectedEffortProp = 1.0;
        selectedReward = 7;
    } else {
        let choice = this.registry.get('choice');
        selectedEffort = choice == 'route 1' ? maxEffortPresses : minEffortPresses;
        selectedReward = choice == 'route 1' ? trialReward1 : trialReward2;
        selectedEffortProp = choice == 'route 1' ? trialEffortPropMax1 : trialEffortPropMax2;  
    }

    const camera = this.cameras.main;
    const centerX = camera.scrollX + camera.width / 2;

    // power panel pops up
    this.powerPanel = new PowerPanel(this, centerX, effortTime, selectedReward, selectedEffortProp, selectedEffort, true);
    
    // we want to start the power up animation when the timer is actually counting down
    eventsCenter.once('powerStatePassed', startPowerUpAnimation, this);
    
    // until time limit reached:
    eventsCenter.once(PRACTICE_POWER_UP_COMPLETE_KEY, effortOutcome, this) 
};

var startPowerUpAnimation = function() {
    this.player.sprite.anims.play('powerup', true);
}

// 3. If participant accepts effort proposal, record button presses and see if they meet threshold
var effortOutcome = function() {
    // get number of achieved button presses 
    let choice = this.registry.get('choice');
    pressCount = this.registry.get('pressCount');
    pressTimes = this.registry.get('pressTimes');  // [?we want this - might make code run slow...]
    
    // if ppt chooses high effort and clears trial effort threshold, fly across sky and collect coins!
    if (choice == 'timeout') {
        trialSuccess = 0;
        pressCount = 0;
        pressTimes = [];

        if (feedbackMessage) {
            // remove feedback message from the screen if its still there
            clearTimeout(routeSelectionTransitionTimer);
            feedbackMessage.destroy();
            feedbackMessage = null;
        }

        // display failure message for a couple of seconds
        feedbackMessage = new Message(
            this,
            gameWidth,
            0xFFDBDB,
            0xFF9696,
            "Too slow - you only have 5\nseconds to choose a route",
            "#9B0000",
            80
        );

        this.tweens.add({        
            targets: feedbackMessage,
            scaleX: { start: 0, to: 1 },
            scaleY: { start: 0, to: 1 },
            ease: 'Linear',    
            duration: pracAnimationTime,
            repeat: 0,      
            yoyo: false
        });
        // then play powerup fail anim and progress via slow route
        this.time.addEvent({delay: pracFeedbackTime + 250, 
                            callback: function(){
                                feedbackMessage.destroy();
                                // then play short 'powerup fail' anim:
                                this.player.sprite.anims.play('powerupfail', true);
                                // and progress via bridge route (with sad face)
                                this.player.sprite.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
                                    // player progresses via bridge and earns no extra reward
                                    this.player.sprite.setVelocityX(playerVelocity/4);   // 4,5,6
                                    this.player.sprite.anims.play('run', true);
                                    this.physics.add.collider(this.player.sprite, this.bridgeEndPoint, 
                                        function(){eventsCenter.emit('bumpme');}, null, this);
                                        eventsCenter.once('bumpme', onejump, this);
                                    });
                            },                         
                            callbackScope: this});
    } else if (pressCount >= selectedEffort) {
        trialSuccess = 1;

        if (feedbackMessage) {
            // remove feedback message from the screen if its still there
            clearTimeout(routeSelectionTransitionTimer);
            feedbackMessage.destroy();
            feedbackMessage = null;
        }

        if (selectedReward == trialReward1 && this.coins1) {
            // add physics colision to the top coins
            this.physics.add.overlap(this.player.sprite, this.coins1.sprite, collectGems, null, this);
        } else if (selectedReward == trialReward2 && this.coins2) {
            // add physics colision to the bottom coins
            this.physics.add.overlap(this.player.sprite, this.coins2.sprite, collectGems, null, this);
        }

        feedbackMessage = new Message(
            this,
            gameWidth,
            0xBCF3D4,
            0x25D070,
            "Nice work!",
            "#10562F",
            80
        );
          
        this.tweens.add({        
            targets: feedbackMessage,
            scaleX: { start: 0, to: 1 },
            scaleY: { start: 0, to: 1 },
            ease: 'Linear',    
            duration: pracAnimationTime,
            repeat: 0,      
            yoyo: false
        });

        // determine if the player floats via the higher or lower routes
        if (selectedEffort == maxEffortPresses) {
            // then player floats across 'high route' and collects coins
            this.time.addEvent({delay: pracFeedbackTime + 250, 
                callback: function(){
                    let playerSpeedAdjustment = window.innerHeight < 800 ? 4 : 3; // slow down the player a bit more on the smaller screens so they dont miss the coins
                    feedbackMessage?.destroy();
                    this.player.sprite.anims.play('float', true);    
                    this.player.sprite.setVelocityX(playerVelocity/playerSpeedAdjustment);
                    this.time.addEvent({ delay: 120, 
                                        callback: function(){this.player.sprite.setVelocityY(-280);},
                                        callbackScope: this, 
                                        repeat: 5 });
                },
                callbackScope: this});
        } else {
            // then player floats across 'low route' and collects coins
            this.time.addEvent({delay: pracFeedbackTime + 250, 
                callback: function() {
                    feedbackMessage?.destroy();
                    this.player.sprite.anims.play('float', true);    
                    this.player.sprite.setVelocityX(playerVelocity/3);
                    this.time.addEvent({ delay: 100,
                                        callback: function(){this.player.sprite.setVelocityY(-120);},
                                        callbackScope: this, 
                                        repeat: 8 });
                },
                callbackScope: this});
            }
    } else {  // else if fail to reach trial effort threshold
        trialSuccess = 0;

        if (feedbackMessage) {
            // remove feedback message from the screen if its still there
            clearTimeout(routeSelectionTransitionTimer);
            feedbackMessage.destroy();
            feedbackMessage = null;
        }

        // display failure message for a couple of seconds
        feedbackMessage = new Message(
            this,
            gameWidth,
            0xFFDBDB,
            0xFF9696,
            "Not enough power this time!",
            "#9B0000",
            80
        );

        this.tweens.add({        
            targets: feedbackMessage,
            scaleX: { start: 0, to: 1 },
            scaleY: { start: 0, to: 1 },
            ease: 'Linear',    
            duration: pracAnimationTime,
            repeat: 0,      
            yoyo: false
        });
        // then play powerup fail anim and progress via slow route
        this.time.addEvent({delay: pracFeedbackTime + 250, 
                            callback: function(){
                                feedbackMessage.destroy();
                                // then play short 'powerup fail' anim:
                                this.player.sprite.anims.play('powerupfail', true);
                                // and progress via bridge route (with sad face)
                                this.player.sprite.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
                                    // player progresses via bridge and earns no extra reward
                                    this.player.sprite.setVelocityX(playerVelocity/4);   // 4,5,6
                                    this.player.sprite.anims.play('run', true);
                                    this.physics.add.collider(this.player.sprite, this.bridgeEndPoint, 
                                        function(){eventsCenter.emit('bumpme');}, null, this);
                                        eventsCenter.once('bumpme', onejump, this);
                                    });
                            },                         
                            callbackScope: this});
    }
};



// 4. When player hits end of scene, save trial data and move on to the next trial (reload the scene)
var pracTrialEnd = function () {
    // determine if pressCount exceeded previous practice trials,
    // we don't want to update the max press count if we've completed the calibration
    if (GameCache.cache?.calibrationComplete == true) {
        maxPressCount = GameCache.cache.maxPressCount;
    } else if (pracTrial == 0 || pressCount > this.registry.get('maxPressCount')) {
        maxPressCount = pressCount;
    }
    this.registry.set('maxPressCount', maxPressCount);

    // set data to be saved into registry
    let practiceTaskAttempt = new PracticeTaskAttempt(
        pracTrial,
        selectedReward, 
        selectedEffort,
        pressCount,
        pressTimes,
        trialSuccess,
        maxPressCount,
        powerCountdown
    );
    this.registry.set("pracTrial"+pracTrial, practiceTaskAttempt);
    // save data
    console.log(this.registry.get("pracTrial"+pracTrial));
    EmbedContext.sendMessage("practiceTrialResult", practiceTaskAttempt.stringify());
    // savePracTaskData(pracTrial, this.registry.get(`pracTrial${pracTrial}`));    // [for firebase]
    //saveTrialDataPav(this.registry.get(`pracTrial${pracTrial}`));             // [for Pavlovia deployment]
    
    let isLastPracticeTrial = pracTrial == nPracTrials - 1;
    // if we encountered an interruption, show the exit dialog but dont increment atempt count.
    // theres no need to reset progress since since the game state isn't updated untill we complete all the practice rounds
    if (this.interruptionExitTaskDialog == true && !isLastPracticeTrial) {
        stopPlayer(this);
        showExitTaskDialog(this);
        this.interruptionExitTaskDialog = false;
    } else {
        // iterate trial number
        pracTrial++; 
        // move to next trial
        this.scene.restart();
    }
};


//////////////////////MISC FUNCTIONS/////////////////////
// function to make coin sprites disappear upon contact with player
// (so player appears to 'collect' them)
var collectGems = function(player, gem) {
    gem.disableBody(true, true);      // individual gems from physics group become invisible upon overlap
};

// function to get player up other side of bridge by performing single jump
// used on reject and unsucessful accept trials
var onejump = function () {
    this.bridgeEndPoint.destroy();
    let jumpHeight = -400;
    this.player.sprite.setVelocityY(jumpHeight);
    let jumpAnimDuration = 1100;
    this.time.delayedCall(jumpAnimDuration, () => { this.player.sprite.setVelocityX(playerVelocity/5); }, null, this);
};

var storeCountdownStarted = function(startTime) {
    powerCountdown = startTime;
}

var stopPlayer = function(context) {
    context.player.sprite.setVelocityX(0);
    context.player.sprite.anims.play('wait', true);
}

var showExitTaskDialog = function(context) {
    let retryTaskText = "The tutorial rounds were interrupted. Please exit and try again.";

    showBottomScreenPanel(
        context,
        "Retry task",
        retryTaskText,
        "EXIT",
        null,
        EXIT_TASK_TAG,
        () => { exitGame(); }, // just exit the task, don't worry about incrementing the attempt count or restarting the game progress
        () => { exitGame(); }
    );
}

var showBottomScreenPanel = function(context, titleText, subtitleText, bottomButtonText, countdownTimerMS, tag, onContinuePressed, onTimeout) {
    let camera = context.cameras.main;

    context.bottomScreenPanel = new BottomScreenPanel(
        context,
        camera.scrollX + camera.width / 2,
        titleText,
        subtitleText,
        bottomButtonText,
        countdownTimerMS,
        tag,
        onContinuePressed,
        onTimeout
    );

    context.tweens.add({        
        targets: context.bottomScreenPanel,
        scaleX: { start: 0, to: 1 },
        scaleY: { start: 0, to: 1 },
        ease: 'Linear',    
        duration: pracAnimationTime,
        repeat: 0,      
        yoyo: false
    });    
}

var exitGame = function() {
    let closeMessage = new CloseMessage(false, false, false);
    EmbedContext.sendMessage('close', closeMessage.stringify());
}
