 ///// UPDATE MANUALLY BEFORE RUNNING STUDY TO ENSURE CONFIGURATION IS SPECIFIED //////
// 1. variables describing this specific task version
const taskName = "rew-eff-ema"; // the name of this task in db: createss data field in firestore/tasks/
const version = "demo"; // version: used to create data collection in firestore/task
// var infoSheet = "./assets/Combined_information_and_consent_ema_motivation_15311_001.pdf";
const gameType = "demo" //"baseline"/"FU"/"demo" (note which type)
const randomiseOrder = false; // true: randomise the game order upon each load (false=defined order)
const debug_mode = false; // turns on console logging 
const demo_mode = true; // a demo game without study info
// UPDATE runPRACTICE to false for FU games ///
const runPractice = true; // run a practice i.e., a baseline version or without practice (FU)
// trials:
const defaultTrialSequenceFile = "trial-seq-1.json" // name of the json file which includes trials
const defaultCatchIdx = [13]; // a default catch idx to use if one is not provided
// End behaviour: 
var complete_link = "https://app.prolific.co/submissions/complete?cc=8B6EC8FC";  // link offered by brain explorer
var buttonText = "Go back"; // text to display on the final button
var powerupDelay = 200; // delay in ms before powerup timer is started

// remainder of settings are automatic

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
var pracTrialEfforts = [75, 75, 75, 75];   // practice effort level (presses)
var pracTrialRewards = [7, 7, 7, 7]; // reward values of gems
var pracTrialEffortProp = 1;
var gemHeights = [255, 180, 220, 255]; // arbitrary heights 
// set a minimum on initial max press count to avoid gaming the practice trials (10% quantile from pilot1)
var minPressMax = 58;   
var thresholdAutoSet = 58;
// set the number of recalibration trials (2= <2 i.e., 0, 1 will recalibrate)
var nCalibrates = 0;
if (runPractice == true) {
	nCalibrates = 2;    // set the number of recalibration trials (2= <2 i.e., 0, 1 will recalibrate)
}
const nBlocks = 4;					

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
var missedTrialLimit = 3; // allows 3 missed trials before showing the 'Are you still there?' message
var missedTrialDialogLimit = 1; // maximum number of times to show the 'Are you still there?' message before exiting the task automatically
var breakTime = 120000; // 2 mins
var taskRewardsPayoutThreshold = 0.8; // requires 80% of trials to be reached before offering monetary payout

export {
	demo_mode, debug_mode, randomiseOrder, runPractice,
	completionMin, completionBonus80, completionBonus100, taskName, version, gameType, approxTime, bonusRate, maxBonus,
	defaultTrialSequenceFile, defaultCatchIdx, maxCoins, thresholdAutoSet,
	effortTime, timeout, gemHeights, pracTrialRewards, pracTrialEfforts, pracTrialEffortProp, minPressMax, nCalibrates,
	nBlocks, complete_link, buttonText, powerupDelay, missedTrialLimit, missedTrialDialogLimit, breakTime, taskRewardsPayoutThreshold
};
