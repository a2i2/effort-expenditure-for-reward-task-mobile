# Effor Expenditure for Reward Task

This project takes the existing work from Dr Agnes Norbury [[1](#attributions)] and ports it to Android and iOS projects for easy testing and evaluation.

## Overview

The project is a stripped down version of the original fork, removing dependencies on Firebase and any analytics components to focus primarily on the task itself.
The Android and iOS projects are available in the `EEFRT Demo Android` and `EEFRT Demo iOS` folders respectively, and using Vite for serving the `public/src` directory and building the game into a `public/dist` directory.

## Getting the local file server up and running
To avoid CORS issues use Vite to serve the files in the `public/src` folder for in-browser support. Please ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (developed with node v20.11.1)
    - If you are using [nvm](https://github.com/nvm-sh/nvm) you can run `nvm use` in the `/public` directory to switch to the correct version of node as specified in the `.nvmrc` file.
- [npm](https://www.npmjs.com/) (developed with npm version v10.2.4)

1. Navigate to the `/public` folder
2. Switch to the required version of node (`nvm use`).
3. Run `npm install` to install the required dependencies
4. Start the server using `npm run dev` which enables auto-restarting when making changes to the codebase.

## Running the EEFRT task on an iOS
1. Ensure you have the local file server running before running the app.
2. Create a symlink to the `/public` folder inside of the `EEFRT Demo iOS/EEFRT Demo` folder within the iOS project:
```bash
cd <path_to_repo>/EEFRT\ Demo\ iOS/EEFRT\ Demo
sudo ln -s ../../public assets
```
3. Open the XCode project, build and run the app on either a simulator or physical device
4. Once the app loads you can run the task by clicking the button which appears on the initial screen. To exit the task early, press the back button in the top left corner, otherwise you'll return once you complete the task.

## Running the EEFRT task on Android
1. Ensure you have the local file server running before running the app.
2. Create a symlink to the `/public` folder inside of the `EEFRT Demo Android/app/src/main` folder within the Android project.
NOTE: Ensure to called the newly created synlink folder `assets` so it can work properly with `WebViewAssetLoader` otherwise you might not be able to view the task when you run the app.
```bash
cd <path_to_repo>/EEFRT\ Demo\ Android/app/src/main
sudo ln -s ../../../public assets
```
3. Open the project in Android Studio, let the Gradle Sync finish and then run the app in a emulator or physical device
4. Once the app loads you can run the task by clicking the button which appears on the initial screen. To exit the task early, press the back button in the top left corner, otherwise you'll return once you complete the task.

## Build distribution directory

Use Vite to build a minified version of the game assets which can be used in a native app.

```bash
npm run build
```

To preview the build run;

```bash
npm run preview
```

## Attributions

1. Original created by [Dr Agnes Norbury](https://www.agnesnorbury.com/); published in [Science Advances](https://www.science.org/doi/full/10.1126/sciadv.adk3222?af=R)

2. The game world was compiled using [Tiled](https://www.mapeditor.org/) using art assets by [kenney](https://kenney.nl/). Based on the [phaser3](https://phaser.io/phaser3) and [rexUI plugins](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/).

## Response Data Structure
Note: When 'Game Time' is mentioned it refers to the Clock used by the Phaser Game Engine which counts in milliseconds from the time the scene is originally created. The scene is restarted whenever a new trial occurs but will retain the same Clock for the scene and thus the the will continue to increment without resetting untill a new scene is reached.

### PracticeTaskAttempt
| Field | Type | Description |
|-------|------|-------------|
| `pracTrialNo` | Number | The current practice trial number. This value is 0-indexed. |
| `trialReward` | Number | The reward in coins for the current trial. For practice trials 1 & 2 (index 0 & 1) there is no visual reward but is automatically set to the higher effort threshold reward. |
| `trialEffort` | Int | The number of taps required to reach the effort threshold for the current practice trial. |
| `pressCount` | Int | The number of times the user pressed the power button during the power up animation. |
| `pressTimes` | Array[Number] | An array containing each time the power button was pressed during the power up animation. Individual press counts are derived from the current Game Time at which the tap occurred. |
| `trialSuccess` | Boolean | Whether or not the user reached the effort threshold current trial (0 or 1). |
| `maxPressCount` | Number | The maximum number of times the power button was pressed during the power up animation. |
| `createdAt` | Date | A timestamp measured in seconds since January 1, 1970 (UTC), of when each trial (practice and main) are saved to the local database. |
| `powerCountdown` | Number | The Game Time at which the power-up countdown timer begins to tick down. |

### TaskAttempt
| Field | Type | Description |
|-------|------|-------------|
| `trialNo` | Number | The trial number. This value is 0-indexed. |
| `trialStartTime` | Number | The current Game Time at which the current trial started. |
| `trialReward1` | Number | The reward in coins for the first choice for the current trial. |
| `trialEffort1` | Number | The number of taps required to reach the effort threshold for the first choice in the current trial. |
| `trialEffortPropMax1` | Float | A percentage value of the number of taps required to reach the effort threshold for the first choice in the current trial vs the `thresholdMax` determined from the calibration trials. |
| `trialReward2` | Number | The reward in coins for the second choice for the current trial. |
| `trialEffort2` | Number | The number of taps required to reach the effort threshold for the second choice in the current trial. |
| `trialEffortPropMax2` | Float | A percentage value of the number of taps required to reach the effort threshold for the second choice in the current trial vs the `thresholdMax` determined from the calibration trials. |
| `choice` | String | The user's choice of which reward they want ('route 1', 'route 2' or 'timeout'). 'Timeout' means they failed to select a route within the time given. |
| `choiceRT` | Float | The time in milliseconds it took for the user to make their choice after being shown the RouteSelectorPanel. |
| `pressCount` | Number | The number of times the user pressed the power button during the power up animation. |
| `pressTimes` | Array[Number] | An array containing each time the power button was pressed curing the power up animation. Individual press counts are derived from the current Game Time at which the tap occured. |
| `trialSuccess` | Boolean | Whether or not the user reached the effort threshold current trial (0 or 1). |
| `coinsRunningTotal` | Float | The total number of coins the user has earned so far in the task across all completed trials. |
| `trialEndTime` | Number | The Game Time at which the current trial is marked as completed, either that be at the end of the power-up animation or as soon as the route selector times out. |
| `effortTimeLimit` | Number | The amount of time in milliseconds given to the user to reach the effort threshold for the current trial. |
| `recalibration` | Boolean | Whether or not the `thresholdMax` was adjusted due to the user reaching a new maximum number of presses (0 or 1). |
| `thresholdMax` | Number | The maximum number of taps the user has achieved so far across all completed trials, include the calibration trials. |
| `createdAt` | Date | A timestamp measured in seconds since January 1, 1970 (UTC). |
| `powerCountdown` | Number | The Game Time at which the power-up countdown timer begins to tick down. |
