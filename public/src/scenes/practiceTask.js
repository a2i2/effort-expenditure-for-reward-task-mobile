// Scene to hold the the pre-task practice / effort callibration scene. Routes to the Main Task scene.

// import js game element modules (sprites, ui, outcome animations, etc.)
import Player from "../elements/player.js";
import Gems from "../elements/gems.js";
import InstructionsPanel from "../elements/instructionsPanel.js";       
import TimerPanel from "../elements/timerPanelClicks.js";

// import our custom events center for passsing info between scenes annd relevant data saving function
import eventsCenter from '../eventsCenter.js'
// import { savePracTaskData, saveThresholdMax} from "../saveData.js";

// import effort info from versionInfo file
import { effortTime, pracTrialEfforts, gemHeights, pracTrialRewards } from "../versionInfo.js";

import Message from "../elements/message.js";

// // import some js from Pavlovia lib to enable data saving [for Pavlovia deployment only]
// import * as data from "../../lib/data-2020.2.js";
// import { saveTrialDataPav } from '../saveData.js';

// initialize some global vars
var gameHeight;
var gameWidth;
var mapWidth;
var mapHeight;
var platforms;
var bridge;
var gemHeight;
const decisionPointX = 370;    // where the info panel will be triggered (x coord in px)
const midbridgeX = 735;        // where gems will be displayed (x coord in px)
const endbridgeX = 765;        // where the player must jump up to cross bridge (x coord in px)
const playerVelocity = 1000;   // baseline player velocity (rightward)
// initialize practice task vars
var pracTrial = 0;
var nGems = 0;
var nPracTrials = pracTrialRewards.length;
var pracTrialReward;
var pracTrialEffort;
var gemHeight;
var feedbackMessage;
var pressCount;
var pressTimes;
var trialSuccess;
var maxPressCount;
// initiliaze timing and response vars
var pracFeedbackTime = 1500;
var pracAnimationTime = 400;
const practiceOrReal = 0;

// this function extends Phaser.Scene and includes the core logic for the game
export default class PracticeTask extends Phaser.Scene {
    constructor() {
        super({
            key: 'PracticeTask'
        });
    }

    preload() {
        ////////////////////PRELOAD GAME ASSETS///////////////////////////////////
        // load tilemap and tileset created using Tiled (see below)
        this.load.tilemapTiledJSON('pmap', './src/assets/tilemaps/tilemap-main-grass.json');
        this.load.image('tiles', '.src/assets/tilesets/tiles_edited_70px_extruded.png');

        // load player sprite
        this.load.spritesheet('player', './src/assets/spritesheets/player1.png', { 
            frameWidth: 90, 
            frameHeight: 96
        });
        
        this.load.image('chapter-1-1', './assets/imgs/chapter-1-1.svg');

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
        
    }
    
    create() {
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

        this.background = this.add.tileSprite(mapWidth/2, mapHeight/2.2, 1107, 970, "chapter-1-1");

        // import scene layers (using names set up in Tiled)
        platforms = pmap.createStaticLayer("platforms", tileset, 0, 0);
        bridge = pmap.createStaticLayer("bridge", tileset, 0, 0);

        // set up collision property for tiles that can be walked on (set in Tiled)
        platforms.setCollisionByProperty({ collide: true });
        bridge.setCollisionByProperty({ collide: true });

        // add plant sprites for texture (randomly positioned on each trial)
        this.plants = this.physics.add.staticGroup();
        for (var i = 0; i < 2; i++) {
            var x = 25;
            var y = 473;
            this.plants.create(x, y, 'smallShrub').setScale(1.2).refreshBody();
        }

        // set the boundaries of the world
        this.physics.world.bounds.width = mapWidth;
        this.physics.world.bounds.height = gameHeight;

        //////////////ADD PLAYER SPRITE////////////////////
        this.player = new Player(this, 0, 300); // (this, spawnPoint.x, spawnPoint.y);
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

        //////////////////////////GET TRIAL INFO//////////////////////////////////  
        // set the two trial options info from trial number
        pracTrialReward = pracTrialRewards[pracTrial];
        pracTrialEffort = pracTrialEfforts[pracTrial];

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

        // // 3. if desired, add listener functions to pause game when focus taken away
        // // from game browser tab/window [necessary for mobile devices]
        window.addEventListener('blur', () => { 
        console.log('pausing game content...');      // useful for debugging pause/resume
            this.scene.pause();
        }, false);
        // // and resume when focus returns
        window.addEventListener('focus', () => { 
            setTimeout(() => {
                console.log('resuming game content...');
                this.scene.resume();
            }, 250);
        }, false);
    }
    
    update(time, delta) {
        ///////////SPRITES THAT REQUIRE TIME-STEP UPDATING FOR ANIMATION//////////
        // allow player to move
        this.player.update(); 
        
        ////////////MOVE ON TO NEXT SCENE WHEN ALL TRIALS HAVE RUN////////////////
        if (pracTrial == nPracTrials) {
            this.registry.set('maxPressCount', maxPressCount);
            // saveThresholdMax(this.registry.get("maxPressCount"));        // [for firebase]
            this.nextScene();
        }
    }
    
    nextScene() {
        this.scene.start('StartTaskScene');
    }
}

///////////////////////////////FUNCTIONS FOR CONTROLLING TRIAL SEQUENCE/////////////////////////////////////
// 1. Once player has hit the decision point, pop up the choice panel with info for that trial
var displayInfoPanel = function () {
    // update some stuff (stop player moving and remove decisionPoint sprite)
    this.player.sprite.setVelocityX(0);
    this.player.sprite.anims.play('wait', true); 
    this.decisionPoint.destroy();
    
    // display gems for this practice go - at a height proportional to the number of gems available
    gemHeight = gemHeights[pracTrial];
    this.gems = new Gems(this, midbridgeX-(pracTrialReward*30)/2, gemHeight, pracTrialReward); 
    
    // popup choice panel with relevant trial info
    let titleTxt = ("Practice "+(pracTrial+1)+" of "+nPracTrials+"!");
    let mainTxt = ("Press [color=#ffffff]POWER[/color]\n" +
                    "as fast\n"+
                    "as possible!");
    let buttonTxt = "Ready!";
    let pageNo = 4;
    this.instructionsPanel = new InstructionsPanel(this, 
                                                   decisionPointX-60, gameHeight/1.4, 
                                                   pageNo, titleTxt, mainTxt, buttonTxt);
    
    // each practice trial has a custom message displayed at the same time as the choice panel,
    // work out which one to display based on the practice trial index
    showMessageForCurrentPracticeTrial(this)

    // once choice is entered, get choice info and route to relevant next step
    eventsCenter.once('page4complete', doChoice, this);       
};

var showMessageForCurrentPracticeTrial = function (context) {
    let messages = [
        "First, let\'s learn how to fly!\nTap the button as fast as you can\nto help Pickle fly. Press \'ready\' to start'.",
        "Great effort!\nLet's try again\npractice makes perfect.",
        "Nice! Now, let\'s learn about routes.\nRoutes require different amounts of\neffort and offer different rewards.",
        "Your turn!\nChoose the route you\'d prefer to take.\nYou have 5 seconds.",
    ]

    let messageTextForCurrentTrial = messages[pracTrial];
    feedbackMessage = new Message(
        context,
        gameWidth,
        "14px monospace",
        0xF6F8F9,
        0xD0D5DD,
        messageTextForCurrentTrial,
        "#000000",
        85,
        160,
        110,
        -5
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
};

// 2. Once participant has indicated they are ready, let them try out the effort panel 
var doChoice = function () {
    // timer panel pops up  
    this.timerPanel = new TimerPanel(this, decisionPointX-60, gameHeight/1.4, effortTime, pracTrialEffort, practiceOrReal); 
    // and play player 'power-up' animation
    this.player.sprite.anims.play('powerup', true);
    
    // until time limit reached:
    eventsCenter.once('practicetimesup', effortOutcome, this) 
};

// 3. If participant accepts effort proposal, record button presses and see if they meet threshold
var effortOutcome = function() {
    // get number of achieved button presses 
    pressCount = this.registry.get('pressCount');
    pressTimes = this.registry.get('pressTimes');  // [?we want this - might make code run slow...]
    
    // if ppt chooses high effort and clears trial effort threshold, fly across sky and collect coins!
    if (pressCount >= pracTrialEffort) {
        trialSuccess = 1;

        if (feedbackMessage) {
            // remove feedback message from the screen if its still there
            feedbackMessage.destroy();
            feedbackMessage = null;
        }

        // add overlap colliders so coins  on either route disappear when overlap with player body
        this.physics.add.overlap(this.player.sprite, this.gems.sprite, collectGems, null, this); 

        feedbackMessage = new Message(
            this,
            gameWidth,
            "16px monospace",
            0xBCF3D4,
            0x25D070,
            "Nice work!",
            "#10562F",
            60,
            130,
            110,
            -10
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
        // then player floats across 'high route' and collects coins
        this.time.addEvent({delay: pracFeedbackTime+250, 
                            callback: function(){
                                feedbackMessage.destroy();
                                this.player.sprite.anims.play('float', true);    
                                this.player.sprite.setVelocityX(playerVelocity/3);
                                this.time.addEvent({ delay: 150, 
                                                     callback: function(){this.player.sprite.setVelocityY(-520+gemHeight);},
                                                     callbackScope: this, 
                                                     repeat: 5 });
                            },
                            callbackScope: this});
    }
    else {  // else if fail to reach trial effort threshold
        trialSuccess = 0;

        if (feedbackMessage) {
            // remove feedback message from the screen if its still there
            feedbackMessage.destroy();
            feedbackMessage = null;
        }

        // display failure message for a couple of seconds
        feedbackMessage = new Message(
            this,
            gameWidth,
            "16px monospace",
            0xFFDBDB,
            0xFF9696,
            "Not enough power this time!",
            "#9B0000",
            60,
            130,
            110,
            -10
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
        this.time.addEvent({delay: pracFeedbackTime+250, 
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
    // determine if pressCount exceeded previous practice trials
    if (pracTrial == 0) {
        maxPressCount = pressCount;
        this.registry.set('maxPressCount', maxPressCount);
    } else if ( pressCount > this.registry.get('maxPressCount') ) {    
       maxPressCount = pressCount;
       this.registry.set('maxPressCount', maxPressCount);
    }
    // set data to be saved into registry
    this.registry.set("pracTrial"+pracTrial, {pracTrialNo: pracTrial, 
                                              trialReward: pracTrialReward,
                                              trialEffort: pracTrialEffort,
                                              pressCount: pressCount,
                                              pressTimes: pressTimes,
                                              trialSuccess: trialSuccess,
                                              gemsRunningTotal: nGems,
                                              maxPressCount: this.registry.get('maxPressCount')
                                             });
    // save data
    console.log(this.registry.get("pracTrial"+pracTrial));
    EmbedContext.sendMessage("practiceTrialResult", this.registry.get("pracTrial"+pracTrial));
    // savePracTaskData(pracTrial, this.registry.get(`pracTrial${pracTrial}`));    // [for firebase]
    //saveTrialDataPav(this.registry.get(`pracTrial${pracTrial}`));             // [for Pavlovia deployment]
    
    // iterate trial number
    pracTrial++; 
    // move to next trial
    this.scene.restart();        // [?wrap in delay function to ensure saving works] 
};


//////////////////////MISC FUNCTIONS/////////////////////
// function to make coin sprites disappear upon contact with player
// (so player appears to 'collect' them)
var collectGems = function(player, gem) {
    gem.disableBody(true, true);      // individual gems from physics group become invisible upon overlap
    nGems++; 
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
