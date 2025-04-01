 ///// UPDATE MANUALLY BEFORE RUNNING STUDY TO ENSURE CONFIGURATION IS SPECIFIED //////
// 1. variables describing this specific task version
const taskName = "rew-eff-ema"; // the name of this task in db: createss data field in firestore/tasks/
const version = "demo"; // version: used to create data collection in firestore/task
// var infoSheet = "./assets/Combined_information_and_consent_ema_motivation_15311_001.pdf";
const gameType = "demo" //"baseline"/"FU"/"demo" (note which type)
const randomiseOrder = true; // true: randomise the questions/game order upon each load (false=game first)
const blockDesktop = true; // true: allow access on mobile online 
const debug_mode = false; // turns on console logging 
const test_game = false; // test the game only (for testing)
const demo_mode = true; // a demo game without study info
// UPDATE runPRACTICE to false for FU games ///
const runPractice = true; // run a practice i.e., a baseline version or without practice (FU)
// trials:
const trialsFile = "trials24.json" // name of the json file which includes trials
const questionsFile = "questions.json" // json file storing the ema questions
var nTrials = 24; // (24=will shuffle trials from 0-23)
var catchIdx = 13; // specify the catch trial manually 
// End behaviour: 
var complete_link = "https://app.prolific.co/submissions/complete?cc=8B6EC8FC";  // link offered by brain explorer
var buttonText = "Go back"; // text to display on the final button
var powerupDelay = 200; // delay in ms before powerup timer is started

// remainder of settings are automatic (except Practice parameters below)
// define the possible scene orders as constants
if (test_game == false) {
	if (runPractice == true) {
		var sceneOrder = [
			'InstructionsScene',
			'practiceTask',
			'StartTaskScene',
			'MainTask',
			'questInstructionsScene',
			'Questions',
			'TaskEndScene'
		];
	}
	else {
		// no practice (follow-up version)
		var sceneOrder = [
			'InstructionsScene',
			'StartTaskScene',
			'MainTask',
			'questInstructionsScene',
			'Questions',
			'TaskEndScene'
        ];
    }
}
else {
	// if we are just testing the game run a simpler order
	var sceneOrder = [
		'StartTaskScene',
		'MainTask',
		'TaskEndScene'
	];
}
Object.freeze(sceneOrder);

// effort calibration description:
// effort is calibrated in this version with a two-stage process
// a. practice trial with max press count 70 (v hard to achieve) sets the initial max press count possible range 40-70
// b. first nCalibrates trials are recalibration trials:
		// if ppt completes in faster than expected time (e.g., 80% effort should take 80% of effortTime)
			// then max press count is recalibrated as (press count/press time(s))*effortTime(s)
		// else 
			// max press count remains at initial level
// c. in FU games, max press count is fetched from firebase and not updated 

// 2. set effort-related calibration variables: 
var effortTime = 10000;	// time participant will have to try and exert effort (ms)
var timeout = 5000; // time to wait for participant to make a choice (ms)
var pracTrialEfforts = [75, 63, 70];   // practice effort level (presses)
var pracTrialRewards = [5, 3, 4]; // reward values of gems
var gemHeights = [255, 180, 220]; // arbitrary heights 
// set a minimum on initial max press count to avoid gaming the practice trials (10% quantile from pilot1)
var minPressMax = 58;   
var thresholdAutoSet = 58;
// set the number of recalibration trials (2= <2 i.e., 0, 1 will recalibrate)
var nCalibrates
if (runPractice == true) {
	var nCalibrates = 2;    // set the number of recalibration trials (2= <2 i.e., 0, 1 will recalibrate)
}
else {
	var nCalibrates = 0;
}
const nBlocks = 2;					

// 3. time and payment:
var approxTime = 6;   	// approx time to complete this version of the experiment (minutes)
var bonusRate = 1;		// additional bonus per task coin collected (GBPpence)
const maxCoins = 109;
var completionBonus80 = 18; // for completing 80% 
var completionBonus100 = 21; // for completing 100% of study
var maxBonus = (maxCoins * bonusRate) / 100;
var nGames = 8; 
var MaxTotalBonus = completionBonus100 + (nGames * maxBonus);
var completionMin = 80;

export {demo_mode,
	debug_mode, sceneOrder, randomiseOrder, runPractice,
	completionMin, completionBonus80, completionBonus100, taskName, version, gameType, approxTime, bonusRate, maxBonus,
	blockDesktop, trialsFile, questionsFile, nTrials, catchIdx, maxCoins, thresholdAutoSet,
	effortTime, timeout, gemHeights, pracTrialRewards, pracTrialEfforts, minPressMax, nCalibrates, nBlocks, complete_link, buttonText, powerupDelay};
