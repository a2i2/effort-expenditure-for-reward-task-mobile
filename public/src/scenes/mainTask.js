// Scene to hold the task. Routes to Task End Scene
import { BaseScene } from "./baseScene.js";

// import js game element modules (sprites, ui, outcome animations, etc.)
import Player from "../elements/player.js";
import Coins from "../elements/coins.js";
import BottomScreenPanel from "../elements/BottomScreenPanel.js";
import StaticObjects from "../elements/staticObjects.js";
import ProgressBar from "../elements/progressBar.js";
import RouteSelectorPanel from "../elements/RouteSelectorPanel.js";

// import our custom events center for passsing info between scenes and relevant data saving function
import eventsCenter from '../eventsCenter.js'
import { shuffleTrials } from "../utils.js";
// import version info
import {
    runPractice, effortTime, nBlocks, nCalibrates, debug_mode,
    defaultTrialSequenceFile, defaultCatchIdx, minPressMax, thresholdAutoSet, randomiseOrder,
    timeout, missedTrialLimit, missedTrialDialogLimit, breakTime, taskRewardsPayoutThreshold
} from "../versionInfo.js";

import Message from "../elements/message.js";
import PowerPanel from "../elements/PowerPanel.js";
import { POWER_UP_COMPLETE_KEY } from "../elements/PowerPanel.js";
import GameCache from "../embedContext/GameCache.js";
import TaskAttempt from "../embedContext/TaskAttempt.js";
import { POWER_COUNTDOWN_KEY } from "../elements/CountdownPanel.js";

// initialize all the global vars (must be a better way of doing this...)
var gameHeight; 
var gameWidth;
var mapHeight;
var mapWidth;
var platforms;
var bridge;
const decisionPointX = 340;    // where the choice panel will be triggered (x coord in px)
const midbridgeX = 605;        // where trial reward coins will be displayed (x coord in px)
const endbridgeX = 765;        // where the player must jump up to cross bridge (x coord in px)
const playerVelocity = 1000;   // baseline player velocity (rightward)
// initialize task vars
var nTrials;
var maxTrials;
var trialNo = 0;
var trialReward1;
var trialEffort1; var trialEffortPropMax1;
var trialReward2; var trialEffortPropMax2;
var trialEffort2;
var trialEffortPropChosen
var trialEffort;
var nCoins = 0; 
var feedbackMessage;
var feedbackTime = 1000;
var animationTime = 400;
var blockNo = 0;
var trialsPerBlock;
// initialize timing and response vars
var trialStartTime;
var choicePopupTime;
var choice;
var choiceCompleteTime;
var choiceRT;
var pressCount;
var pressStartTime
var pressEndTime
var pressTimes;
var trialSuccess;
var trialEndTime;
var maxPressCount;
var thresholdMax;
var practiceorReal = 1; // use the main task instruction panels 
var coinsWonThisTrial = 0;
var smallDeviceOffset = 0;
var consecutiveMissedTrials = 0;
var missedTrialDialogsShown = 0;
var randTrialsIdx;
var powerCountdown;

// this function extends Phaser.Scene and includes the core logic for the game
export default class MainTask extends BaseScene {
    constructor() {
        super({
            key: 'MainTask'
        });

        this.staticObjManager = new StaticObjects(this);
    }

    preload() {
        // if a trial sequence file is provided, use it, otherwise use the default
        this.trialSequenceFile = GameCache.cache?.trialSeqFilename ?? defaultTrialSequenceFile;

        ////////////////////PRELOAD GAME ASSETS///////////////////////////////////
        // load tilemap and tileset created using Tiled (see below)
        this.load.tilemapTiledJSON('grass-map', './src/assets/tilemaps/tilemap-main-grass.json');
        this.load.tilemapTiledJSON('snow-map', './src/assets/tilemaps/tilemap-main-snow.json');
        this.load.image('tiles', './src/assets/tilesets/tiles_edited_70px_extruded.png');

        // load player sprite
        this.load.spritesheet('player', './src/assets/spritesheets/player1.png', { 
            frameWidth: 90, 
            frameHeight: 96
        });
        
        // load scene images to add some texture to background
        this.load.image('button', './src/assets/imgs/button.png');
        // SVGs
        this.staticObjManager.loadImages();

        // close button
        this.load.image('close', './src/assets/imgs/close.svg');

        // lightning bolt power:
        this.load.image('powerOFF', './src/assets/imgs/lightning-bolt-80_empty.png')
        this.load.image('powerON', './src/assets/imgs/lightning-bolt-80_filled.png')

        // load animated coin sprite (these will represent offered reward level)
        this.load.spritesheet('coin', './src/assets/spritesheets/coin.png', { 
            frameWidth: 15.8, 
            frameHeight: 16 
        });
        
        // load trial type info from json array
        this.load.json('trials', './src/assets/' + this.trialSequenceFile);

        // Chapter 1 has two different backgrounds, rather than five
        this.load.image('chapter-1-1', './src/assets/imgs/chapter-1-1.svg');
        this.load.image('chapter-1-2', './src/assets/imgs/chapter-1-2.svg');
        // Chapter 2 to 4 have five backgrounds
        this.load.image('chapter-2-1', './src/assets/imgs/chapter-2-1.svg');
        this.load.image('chapter-2-2', './src/assets/imgs/chapter-2-2.svg');
        this.load.image('chapter-2-3', './src/assets/imgs/chapter-2-3.svg');
        this.load.image('chapter-2-4', './src/assets/imgs/chapter-2-4.svg');
        this.load.image('chapter-2-5', './src/assets/imgs/chapter-2-5.svg');

        this.load.image('chapter-3-1', './src/assets/imgs/chapter-3-1.svg');
        this.load.image('chapter-3-2', './src/assets/imgs/chapter-3-2.svg');
        this.load.image('chapter-3-3', './src/assets/imgs/chapter-3-3.svg');
        this.load.image('chapter-3-4', './src/assets/imgs/chapter-3-4.svg');
        this.load.image('chapter-3-5', './src/assets/imgs/chapter-3-5.svg');

        this.load.image('chapter-4-1', './src/assets/imgs/chapter-4-1.svg');
        this.load.image('chapter-4-2', './src/assets/imgs/chapter-4-2.svg');
        this.load.image('chapter-4-3', './src/assets/imgs/chapter-4-3.svg');
        this.load.image('chapter-4-4', './src/assets/imgs/chapter-4-4.svg');
        this.load.image('chapter-4-5', './src/assets/imgs/chapter-4-5.svg');

        // load coin images
        for (let i = 1; i <= 7; i++) {
            this.load.image(`coins-${i}`, `./src/assets/imgs/coins-${i}.svg`);
        }
    }
    
    create() {
        ////////////////////////CREATE WORLD//////////////////////////////////////
        // game world created in Tiled (https://www.mapeditor.org/)
        // import tilemap

        //////////////////////////GET TRIAL INFO//////////////////////////////////  
        // load trial info (must be done within create())
        let trials = this.cache.json.get("trials");
        nTrials = trials.reward1.length;
        maxTrials = nTrials;
        trialsPerBlock = nTrials / nBlocks;  // blocks divide trials
        let catchIdx = trials.catchIdx ?? defaultCatchIdx;

        // determine the maxPresscount and generate the randTrialsIdx if required
        setUpMaxThreshold(this);
        setUpRandTrialsIdx(catchIdx, this.trialSequenceFile);

        // setup the game with the cached game state if present
        loadGameFromCache();

        if (window.innerHeight < 800) {
            smallDeviceOffset = -175;
        }

        // 3rd block is a "snow" level
        var mapKey = (blockNo == 2) ? 'snow-map' : 'grass-map';
        var map = this.make.tilemap({ key: mapKey });
        var tileset = map.addTilesetImage("tiles_edited_70px_extruded", "tiles"); // first arg must be name used for the tileset in Tiled

        // grab some size variables that will be helpful later
        gameHeight = this.sys.game.config.height;
        gameWidth = this.sys.game.config.width;
        mapHeight = map.heightInPixels;
        mapWidth = map.widthInPixels;

        // determine the background based on the current block (chapter)
        var bgStr = 'chapter-1-1';
        var i = 0;
        if (blockNo == 0) {
            i = Math.floor(Math.random() * 2) + 1; // only 2 variants
            bgStr = `chapter-1-${i}`;
        } else {
            i = Math.floor(Math.random() * 5) + 1; // 5 variants
            bgStr = `chapter-${blockNo+1}-${i}`;
        }

        this.background = this.add.tileSprite(mapWidth/2, mapHeight/2.2 + smallDeviceOffset, 1107, 970, bgStr);

        // import scene layers (using names set up in Tiled)
        platforms = map.createStaticLayer("platforms", tileset, 0, 0 + smallDeviceOffset);
        bridge = map.createStaticLayer("bridge", tileset, 0, 0 + smallDeviceOffset);
        
        // set up collision property for tiles that can be walked on (set in Tiled)
        platforms.setCollisionByProperty({ collide: true });
        bridge.setCollisionByProperty({ collide: true });

        // add scene sprites/images for texture (randomly positioned on each trial)
        let objManager = new StaticObjects(this);
        // determine decision x coordinate for left of bridge
        var x = Phaser.Math.RND.between(50, decisionPointX-60);
        objManager.addRandomObject(x, smallDeviceOffset, blockNo === 1);
        // determine x coordinate for right of bridge
        x = Phaser.Math.RND.between(860, mapWidth-100);
        objManager.addRandomObject(x, smallDeviceOffset, blockNo === 1);

        // set the boundaries of the world
        this.physics.world.bounds.width = mapWidth;
        this.physics.world.bounds.height = gameHeight;

        //////////////ADD PROGRESS BAR////////////////////
        const insetTop = EmbedContext.getInsetTop();
        // Create progress bar at the top of the screen with nBlocks segments
        this.progressBar = new ProgressBar(this, 24, insetTop, nBlocks, trialNo, {
            height: 10,
            padding: 4,
            cornerRadius: 5,
            trialsPerBlock
        });
        // Make it stay fixed on screen (not affected by camera)
        this.progressBar.setScrollFactor(0);

        this.closeButton = this.add.image(gameWidth - 24, insetTop + 5, 'close');
        this.closeButton.setScrollFactor(0);
        this.closeButton.setInteractive();
        this.closeButton.on('pointerdown', () => {
            let shouldShowExitDialog = true
            exitGame(shouldShowExitDialog);
        });

        //////////////ADD PLAYER SPRITE////////////////////
        this.player = new Player(this, 0, 350 + smallDeviceOffset); // (this, spawnPoint.x, spawnPoint.y);
        this.physics.add.collider(this.player.sprite, platforms); 
        this.physics.add.collider(this.player.sprite, bridge);       // player walks on platforms and bridge

        //////////////CONTROL CAMERA///////////////////////
        this.cameras.main.startFollow(this.player.sprite);           // camera follows player
        this.cameras.main.setBounds(0, 0, mapWidth, gameHeight);
        
        ///////////INSTRUCTIONS & SCORE TEXT///////////////
//        // add instructions text in a fixed position on the screen
//        this.add
//            .text(16, 16, "choose the high route to earn bonus coins!", {
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

        // randomly select the order of trials for ema study:
        // save the random index:
        // set data to be saved into registry
        if (debug_mode) { console.log('trial number: '+trialNo)}
        if (trialNo < (nTrials)) {
            // error on baseline game (nTrials-1) means some participants did not get catchTrial 28.06.23
            this.registry.set("trial" + trialNo, {
                trialIdx: randTrialsIdx[trialNo]
            });
            // save data
            // saveTaskData(trial, this.registry.get(`trial${trial}`)); // [for firebase]
            if (debug_mode) { console.log('trial idx: ' + randTrialsIdx[trialNo]) }
        };
        // index trials from random index
        trialReward1 = trials.reward1[randTrialsIdx[trialNo]];
        trialEffortPropMax1 = trials.effort1[randTrialsIdx[trialNo]];
        trialEffort1 = Math.round(trialEffortPropMax1*maxPressCount); 
        trialReward2 = trials.reward2[randTrialsIdx[trialNo]];
        trialEffortPropMax2 = trials.effort2[randTrialsIdx[trialNo]];
        trialEffort2 = Math.round(trialEffortPropMax2*maxPressCount); 
        
        // log trial start time
        trialStartTime = Math.round(this.time.now);


        //////////////////////////TRIAL CONTROL POINTS///////////////////////////
        // 0. First, let's add some invisible to sprites regions of space that key trial 
        // events depend on, so that our player can collide (interact) with them
        // 0.1 point where the choice panel is triggered:
        this.decisionPoint = this.physics.add.sprite(decisionPointX, gameHeight/2);   
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
        this.trialEndPoint = this.physics.add.sprite(mapWidth-20, gameHeight/2);
        this.trialEndPoint.displayHeight = gameHeight;  
        this.trialEndPoint.immovable = true;
        this.trialEndPoint.body.moves = false;
        this.trialEndPoint.allowGravity = false;
        
        // 1. Upon entering scene, player moves right until they encounter the decisionPoint
        this.player.sprite.setVelocityX(playerVelocity*2.5);  // positive X velocity -> move R
        this.player.sprite.anims.play('run', true);
        this.physics.add.collider(
            this.player.sprite,
            this.decisionPoint,
            () => { eventsCenter.emit('choicePanelOn'); },
            null,
            this
        ); // once the player has collided with invisible decision point, emit event
        // once this event is detected, perform the function displayChoicePanel (only once)
        eventsCenter.once('choicePanelOn', displayChoicePanel, this);
        
        // 2. After trial outcome (reject, accept+successful, accept+unsuccessful), 
        // player moves right again until they encounter the trial end point
        this.physics.add.collider(this.player.sprite, this.trialEndPoint, 
                          function(){eventsCenter.emit('trialEndHit');}, null, this); // once the player has collided with invisible trial end point, emit event
        // once this event us detected, perform the function trialEnd (only once)
        eventsCenter.once('trialEndHit', trialEnd, this);

        eventsCenter.once(POWER_COUNTDOWN_KEY, storeCountdownStarted, this);
        
        // // 3. if desired, add listener functions to pause game when focus taken away
        // // from game browser tab/window [necessary for mobile devices]
        // window.addEventListener('blur', () => { 
        //     //console.log('pausing game content...');      // useful for debugging pause/resume
        //     this.scene.pause();
        // }, false);
        // // and resume when focus returns
        // window.addEventListener('focus', () => { 
        //     setTimeout( () => { 
        //         //console.log('resuming game content...'); 
        //         this.scene.resume();
        //     }, 250); 
        // }, false);
    }
    
    update(time, delta) {
        ///////////SPRITES THAT REQUIRE TIME-STEP UPDATING FOR ANIMATION//////////
        // allow player to move
        this.player.update(); 
        
        ////////////MOVE ON TO NEXT SCENE WHEN ALL TRIALS HAVE RUN////////////////
        if (trialNo == maxTrials) {
            this.nextScene();
        }
    }

    nextScene() {
        this.registry.set('CoinsRunningTotal', nCoins);
        this.launchNextScene();
    }
}

///////////////////////////////FUNCTIONS FOR CONTROLLING TRIAL SEQUENCE/////////////////////////////////////
// 1. Once player has hit the decision point, pop up the choice panel with info for that trial
var displayChoicePanel = function () {
    // record time
    choicePopupTime = this.time.now; 
    // update some stuff (stop player moving and remove decisionPoint sprite)
    this.player.sprite.setVelocityX(0);
    this.player.sprite.anims.play('wait', true);
    this.decisionPoint.destroy();
    
    // display reward coins for each option
    this.coins1 = new Coins(this, midbridgeX-(trialReward1*30)/2, 235 + smallDeviceOffset, trialReward1); // coins in sky
    this.coins2 = new Coins(this, midbridgeX-(trialReward2*30)/2, 360 + smallDeviceOffset, trialReward2); // coins on bridge

    const camera = this.cameras.main;
    const centerX = camera.scrollX + camera.width / 2;

    const panel = new RouteSelectorPanel(
        this,
        centerX,
        trialReward1,
        trialEffortPropMax1,
        trialReward2,
        trialEffortPropMax2,
        (selected) => {
            this.registry.set('choice', selected);
            eventsCenter.emit('choiceComplete');
        },
        timeout
    );
    this.add.existing(panel.container);
    
    // once choice is entered, get choice info and route to relevant next step
    eventsCenter.once('choiceComplete', doChoice, this);
};

// 2. Once choice (to accept or reject proposed option) has been made, route to relevant components 
var doChoice = function () {
    // calculate decision RT
    choiceCompleteTime = this.time.now; 
    choiceRT = Math.round(choiceCompleteTime - choicePopupTime); 
    // and get info on chosen option
    choice = this.registry.get('choice');
    const camera = this.cameras.main;
    const centerX = camera.scrollX + camera.width / 2;
    
    if (choice == 'route 1') {  // if participant chooses the high effort option
        // timer panel pops up  
        this.powerPanel = new PowerPanel(this, centerX, effortTime, trialReward1, trialEffortPropMax1, trialEffort1);
        // and play player 'power-up' animation
        this.player.sprite.anims.play('powerup', true);
        // until time limit reached:
        eventsCenter.once(POWER_UP_COMPLETE_KEY, effortOutcome, this)
        }
    else if (choice == 'route 2') {  // if participant chooses the low effort option
        // timer panel pops up  
        this.powerPanel = new PowerPanel(this, centerX, effortTime, trialReward2, trialEffortPropMax2, trialEffort2);
        // and play player 'power-up' animation
        this.player.sprite.anims.play('powerup', true);
        // until time limit reached:
        eventsCenter.once(POWER_UP_COMPLETE_KEY, effortOutcome, this)
    } else { // user failed to make a choice before timeout
        // No TimerPanel to emit the timesup event, so we emit it manually so the 'this' context can be passed through
        eventsCenter.once(POWER_UP_COMPLETE_KEY, effortOutcome, this);
        eventsCenter.emit(POWER_UP_COMPLETE_KEY);
    }
};

// 3. If participant accepts effort proposal, record button presses and see if they meet threshold
var effortOutcome = function() {
    choice = this.registry.get('choice');
    // get number of achieved button presses 
    pressCount = this.registry.get('pressCount');
    pressTimes = this.registry.get('pressTimes');  // [?we want this - might make code run slow...]
    
    // if ppt chooses high effort and clears trial effort threshold, fly across sky and collect coins!
    if (choice == 'route 1' && pressCount >= trialEffort1) {
        trialSuccess = 1;
        consecutiveMissedTrials = 0;

        // add overlap colliders so coins disappear when overlap with player body
        this.physics.add.overlap(this.player.sprite, this.coins1.sprite, collectCoins, null, this);

        // display success message for a couple of seconds,
        this.feedbackMessage = new Message(
            this,
            gameWidth,
            0xBCF3D4,
            0x25D070,
            "Nice work!",
            "#10562F",
            80
        );
        this.tweens.add({        
            targets: this.feedbackMessage,
            scaleX: { start: 0, to: 1 },
            scaleY: { start: 0, to: 1 },
            ease: 'Linear',    
            duration: animationTime,
            repeat: 0,      
            yoyo: false
        });

        // then player floats across 'high route' and collects coins
        this.time.addEvent({delay: feedbackTime, 
                            callback: function(){
                                this.feedbackMessage.destroy();
                                this.player.sprite.anims.play('float', true);    
                                this.player.sprite.setVelocityX(playerVelocity/3);
                                this.time.addEvent({ delay: 120,
                                                     callback: function(){this.player.sprite.setVelocityY(-280);},
                                                     callbackScope: this, 
                                                     repeat: 5 });
                            },
                            callbackScope: this});
    }
    // if ppt chooses low effect and clears trial effort threshold, fly across mid-sky and collect coins!
    else if (choice == 'route 2' && pressCount >= trialEffort2)  {
        trialSuccess = 1;
        consecutiveMissedTrials = 0;

        // add overlap colliders so coins disappear when overlap with player body
        this.physics.add.overlap(this.player.sprite, this.coins2.sprite, collectCoins, null, this, trialNo); 

        // display success message for a couple of seconds,
        this.feedbackMessage = new Message(
            this,
            gameWidth,
            0xBCF3D4,
            0x25D070,
            "Nice work!",
            "#10562F",
            80
        );
        this.tweens.add({        
            targets: this.feedbackMessage,
            scaleX: { start: 0, to: 1 },
            scaleY: { start: 0, to: 1 },
            ease: 'Linear',    
            duration: animationTime,
            repeat: 0,      
            yoyo: false
        });

        // then player floats across 'low route' and collects coins
        this.time.addEvent({delay: feedbackTime, 
                            callback: function() {
                                this.feedbackMessage.destroy();
                                this.player.sprite.anims.play('float', true);    
                                this.player.sprite.setVelocityX(playerVelocity/3);
                                this.time.addEvent({ delay: 100,
                                                     callback: function(){this.player.sprite.setVelocityY(-120);},
                                                     callbackScope: this, 
                                                     repeat: 8 });
                            },
                            callbackScope: this});
    }
    else if (choice == 'timeout') {
        trialSuccess = 0;
        consecutiveMissedTrials += 1;

        // display failure message for a couple of seconds
        this.feedbackMessage = new Message(
            this,
            gameWidth,
            0xFFDBDB,
            0xFF9696,
            "Too slow - you only have 5\nseconds to choose a route",
            "#9B0000",
            80
        );
        this.tweens.add({        
            targets: this.feedbackMessage,
            scaleX: { start: 0, to: 1 },
            scaleY: { start: 0, to: 1 },
            ease: 'Linear',    
            duration: animationTime,
            repeat: 0,      
            yoyo: false
        });
        // then play powerup fail anim and progress via slow route
        this.time.addEvent({delay: feedbackTime+250, 
                            callback: function() {
                                this.feedbackMessage.destroy();  // Add this line to destroy the background
                                // then play short 'powerup fail' anim:
                                // this.player.sprite.anims.play('powerupfail', true);
                                // and progress via bridge route (with sad face)
                                    // player progresses via bridge and earns no extra reward
                                this.player.sprite.setVelocityX(playerVelocity/5);   // 5,6
                                this.player.sprite.anims.play('sadrun', true);
                                this.physics.add.collider(this.player.sprite, this.bridgeEndPoint, 
                                                            function(){eventsCenter.emit('bumpme');}, null, this); 
                                eventsCenter.once('bumpme', onejump, this);
                            },                         
                            callbackScope: this});

    } else {  // else if fail to reach trial effort threshold
        trialSuccess = 0;
        consecutiveMissedTrials = 0;

        // display failure message for a couple of seconds
        this.feedbackMessage = new Message(
            this,
            gameWidth,
            0xFFDBDB,
            0xFF9696,
            "Not enough power this time!",
            "#9B0000",
            80
        );
        this.tweens.add({        
            targets: this.feedbackMessage,
            scaleX: { start: 0, to: 1 },
            scaleY: { start: 0, to: 1 },
            ease: 'Linear',    
            duration: animationTime,
            repeat: 0,      
            yoyo: false
        });
        // then play powerup fail anim and progress via slow route
        this.time.addEvent({delay: feedbackTime+250, 
                            callback: function() {
                                this.feedbackMessage.destroy();
                                // then play short 'powerup fail' anim:
                                this.player.sprite.anims.play('powerupfail', true);
                                // and progress via bridge route (with sad face)
                                this.player.sprite.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
                                    // player progresses via bridge and earns no extra reward
                                    this.player.sprite.setVelocityX(playerVelocity/5);   // 5,6
                                    this.player.sprite.anims.play('sadrun', true);
                                    this.physics.add.collider(this.player.sprite, this.bridgeEndPoint, 
                                                              function(){eventsCenter.emit('bumpme');}, null, this); 
                                    eventsCenter.once('bumpme', onejump, this);
                                    });
                            },                         
                            callbackScope: this});
    }

    // save the data immediately after powerup/timeout in the event the walking animation gets interrupted before it completes
    saveData(this);
};

// 4. When player hits end of scene, save trial data and move on to the next trial (reload the scene)
var trialEnd = function () {
    // if the user has been shown the 'Are you still there?' message and they trigger it again, kick them out of the task
    let isLastTrial = trialNo == nTrials - 1;
    let missedTrialDialogShownLimitReached = (missedTrialDialogsShown >= missedTrialDialogLimit) && missedTrialDialogLimit > 0; // ensure that a limit of 0 allows the dialog to be shown as many times as needed
    if (consecutiveMissedTrials >= missedTrialLimit && !isLastTrial && missedTrialDialogShownLimitReached) {
        stopPlayer(this);
        showTimeUpDialog(this);
    }
    // If the 3rd missed trial ends up on the same trial as the break then we want to show the 'Are you still there?' message. If they press continue they will continue to the next block
    else if (consecutiveMissedTrials >= missedTrialLimit && !isLastTrial) {
        stopPlayer(this);
        showMissedTrialDialog(this);
    }
    // if end of task, display taskend screen 
    // if end of block, display end of block screen
    else if ((trialNo + 1) % trialsPerBlock == 0 && !isLastTrial) {
        stopPlayer(this);
        showBreakDialog(this);
    }
    else {
        // iterate trial number
        trialNo++;     
        // move to next trial
        this.scene.restart();        // [?wrap in delay function to ensure saving works]
    }
};

//////////////////////MISC FUNCTIONS/////////////////////
// function to get player up other side of bridge by performing single jump
// used on reject and unsucessful accept trials
var onejump = function() {
    this.bridgeEndPoint.destroy();
    let jumpHeight = -400;
    this.player.sprite.setVelocityY(jumpHeight);
    let jumpAnimDuration = 1100;
    this.time.delayedCall(jumpAnimDuration, () => { this.player.sprite.setVelocityX(playerVelocity/5); }, null, this);
};

// function to make coin sprites disappear upon contact with player
// (so player appears to 'collect' them)
var collectCoins = function(player, coin, trial) {
    coin.disableBody(true, true);   // individual coins from group become invisible upon overlap
};

// function which restores the game state based on the given cache state
var loadGameFromCache = function() {
    const cache = GameCache.cache;
    if (cache == null) {
        return; // no cache to load from so just return
    }

    // set up the game based on the previous state
    trialNo = cache.trialNumber ?? 0;
    maxPressCount = cache.maxPressCount ?? thresholdAutoSet;
    nCoins = cache.coinRunningTotal ?? 0;
    randTrialsIdx = cache.randTrialsIdx ?? randTrialsIdx; // this was already set from the global scope so keep it if we dont have it in the cache
    blockNo = Math.floor(trialNo / trialsPerBlock);
}

// sets up the max presses count depending on if the user did the practice or not
var setUpMaxThreshold = function(context) {
    // if a practice is run, take the minPressMax from the practice task
    // otherwise assign maxPressCount as the fetched threshold max
    if (runPractice == true && trialNo == 0) {
        maxPressCount = context.registry.get('maxPressCount');
        if (maxPressCount < minPressMax) {
            // enforce minimum to guard against gaming from practice
            maxPressCount = minPressMax;
        }
    }
    else {
        // add a catch if thresholdMax is undefined
        if (typeof thresholdMax === "undefined") {
            maxPressCount = thresholdAutoSet;
        } else {
            maxPressCount = thresholdMax; // fetch 
        }
    };
}

var setUpRandTrialsIdx = function(catchIdx, trialSequenceFile) {
    if (GameCache.cache?.randTrialsIdx) {
        randTrialsIdx = GameCache.cache.randTrialsIdx;
        return;
    }

    if (!randomiseOrder) {
        randTrialsIdx = Array.from({ length: nTrials }, (_, i) => i);
    } else {
        randTrialsIdx = shuffleTrials(nTrials, catchIdx, nCalibrates);
    }
    GameCache.cache = new GameCache(true, 0, maxPressCount, 0, {}, randTrialsIdx, trialSequenceFile);
    EmbedContext.sendMessage('currentGameCache', JSON.stringify(GameCache.cache));
}

var continueGameAfterBreak = function(context) {
    // iterate trial number
    trialNo++;

    // increment the block if required
    if (trialNo % trialsPerBlock == 0) {
        blockNo++;
    }

    // move to next trial
    context.scene.restart();
}

var exitGame = function(shouldShowExitDialog) {
    EmbedContext.sendMessage('close', shouldShowExitDialog);
}

var stopPlayer = function(context) {
    context.player.sprite.setVelocityX(0);
    context.player.sprite.anims.play('wait', true);
}

var showMissedTrialDialog = function(context) {
    let missedTrialsDialogText = "Continue within the next 2 minutes to keep collecting coins.";
    missedTrialDialogsShown += 1;
    consecutiveMissedTrials = 0;

    showBottomScreenPanel(
        context,
        "Are you still there?",
        missedTrialsDialogText,
        "CONTINUE",
        breakTime,
        () => { continueGameAfterBreak(context); },
        () => { showTimeUpDialog(context); }
    );
}

var showTimeUpDialog = function(context) {
    var timeoutMessage;
    if (trialNo + 1 >= nTrials * taskRewardsPayoutThreshold) {
        timeoutMessage = "Unfortunately you've run out of time to continue the this task, but you'll still recieve a bonus payout.";
    } else {
        timeoutMessage = "Unfortunately you've run out of time to continue the this task. Try again to recieve a bonus payment.";
    }

    showBottomScreenPanel(
        context,
        "Times up!",
        timeoutMessage,
        "EXIT",
        null,
        () => { exitGame(false); }, // no need to show the exit dialog as we're already showing the time up dialog
        () => { exitGame(false); } // no need to show the exit dialog as we're already showing the time up dialog
    );
}

var showBreakDialog = function(context) {
    let breakTextContent = "You\'re doing an amazing job!\nTake a short break if you need one. The task will automatically continue after 2 minutes.";
    showBottomScreenPanel(
        context,
        "Break time",
        breakTextContent,
        "CONTINUE",
        breakTime,
        () => { continueGameAfterBreak(context); }, // continue the game regardless after the break is automatically or manually stopped
        () => { continueGameAfterBreak(context); }
    );
}

var showBottomScreenPanel = function(context, titleText, subtitleText, bottomButtonText, countdownTimerMS, onContinuePressed, onTimeout) {
    let camera = context.cameras.main;

    context.bottomScreenPanel = new BottomScreenPanel(
        context,
        camera.scrollX + camera.width / 2,
        titleText,
        subtitleText,
        bottomButtonText,
        countdownTimerMS,
        onContinuePressed,
        onTimeout
    );

    context.tweens.add({        
        targets: context.bottomScreenPanel,
        scaleX: { start: 0, to: 1 },
        scaleY: { start: 0, to: 1 },
        ease: 'Linear',    
        duration: animationTime,
        repeat: 0,      
        yoyo: false
    });    
}

var storeCountdownStarted = function(startTime) {
    powerCountdown = startTime;
}

var saveData = function(context) {
    // get trial end time
    trialEndTime = Math.round(context.time.now);

    // n.b. nCalibrates now set in versionInfo.js
    // we completed the practice, but might be loading back from a cached run so we've already calibrated
    var updatedNumCalibrates = nCalibrates;
    if (GameCache.cache?.practiceComplete == true && runPractice) {
        updatedNumCalibrates = 0;
    }

    if (trialNo < updatedNumCalibrates) {
        // get variables to use 
        pressTimes = context.registry.get('pressTimes');
        pressCount = context.registry.get('pressCount');
        pressStartTime = pressTimes[0]; // pressStartTime is the first pressTime
        pressEndTime = pressTimes[pressTimes.length - 1]; // pressEndTime is the last pressTime

        // get level of effort chosen
        if (choice == 'route 1') {
            trialEffortPropChosen = trialEffortPropMax1;
            trialEffort = trialEffort1;
        }
        else {
            trialEffortPropChosen = trialEffortPropMax2; // else they chose route 2
            trialEffort = trialEffort2;
        }
        // for success trials if pressTime was faster than expected given the effort level, recalibrate
        if (pressCount >= trialEffort &&
            ((pressEndTime - pressStartTime) < (effortTime * trialEffortPropChosen))) {
            // calculate their new 100% threshold
            var threshold = Math.round(((pressCount / ((pressEndTime - pressStartTime) / 1000)) * (effortTime / 1000)))
            // if threshold is greater than the original maxPress: thresholdMax is updated 
            if (threshold > maxPressCount) {
                thresholdMax = threshold
                var recalibration = 1;
            }
            else {
                // continue with thresholdMax at maxPressCount 
                var recalibration = 0;
                thresholdMax = maxPressCount;
            }
        }
        else {// the trial wasn't successful or did not need recalibration: 
            var recalibration = 0; // record recalibration didn't occur
            // also keep thresholdMax at maxPressCount
            thresholdMax = maxPressCount

        }
        // save thresholdMax
        context.registry.set("thresholdMax", { thresholdMax });
        // save it in its own document for easy retrieval later 
        // saveThresholdMax(this.registry.get("thresholdMax"));        // [for firebase]
    }
    else { // if we are past the first calibration trials 
        var recalibration = 0; // record recalibration didn't occur
        thresholdMax = maxPressCount // do not adjust thresholdMax 
    };

    // as a fallback for the case where the player misses the coins, we will add the coins regardless if the player touches them or not
    if (trialSuccess && choice == 'route 1') {
        coinsWonThisTrial = trialReward1;
        nCoins += coinsWonThisTrial;
    } else if (trialSuccess && choice == 'route 2') {
        coinsWonThisTrial = trialReward2;
        nCoins += coinsWonThisTrial;
    } else {
        coinsWonThisTrial = 0;
    }

    if (choice == 'timeout') {
        // if the choice was a timeout then reset all the relevant variables so the payload doesn't retain the previous trial's data
        trialEffortPropChosen = 0;
        trialEffort = 0;
        choiceRT = 0;
        pressCount = 0;
        pressTimes = [];
        trialSuccess = 0;
        pressStartTime = 0;
        pressEndTime = 0;
        coinsWonThisTrial = 0;
    }

    // set data to be saved into registry
    let taskAttempt = new TaskAttempt(
        trialNo,
        trialStartTime,
        trialReward1,
        trialEffort1,
        trialEffortPropMax1,
        trialReward2,
        trialEffort2,
        trialEffortPropMax2,
        choice,
        choiceRT,
        pressCount,
        pressTimes,
        trialSuccess,
        nCoins,
        trialEndTime,
        effortTime,
        recalibration,
        thresholdMax
    );

    // save the data in a registry for later retrieval
    context.registry.set("trial" + trialNo, taskAttempt);

    // save data
    EmbedContext.sendMessage("trialResult", taskAttempt.stringify());
    console.log(context.registry.get("trial" + trialNo));
    // saveTaskData(trial, this.registry.get(`trial${trial}`));        // [for firebase]
    //saveTrialDataPav(this.registry.get(`trial${trial}`));         // [for Pavlovia deployment only]

    // save the current coin choice to the cache by adding on to the previous dictionary if present
    let coinChoices = GameCache.cache?.trialResults ?? {};
    coinChoices['trial' + trialNo] = trialSuccess ? coinsWonThisTrial : 0;

    // notify the native apps of what the current game state is so they can cache it
    let currentGameState = new GameCache(true, trialNo + 1, maxPressCount, nCoins, coinChoices, randTrialsIdx, context.trialSequenceFile);
    GameCache.cache = currentGameState;
    EmbedContext.sendMessage('currentGameCache', currentGameState.stringify());
}
