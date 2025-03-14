## Overview 
Data hosted on [open science framework](https://osf.io/3mhqb/)

Code for main analyses: analysis/script (analysis/functions/ for dependency custom functions)

behaviour_analysis.R: all analysis of ecological momentary assessment (self-report) and task data, including all manuscript figures

model-fit-cmdstanr.Rmd: fit hierarchical computational models in cmdstanr  

model-analysis.R: additional model checks and statistics after fitting 

fetch-data.ipynb: python example script to retrieve data from firebase if using the task

for hierarchical modelling 
analysis/stan_models & analysis/stan_fits

(you may need to change the source paths or re-fit models due to the way [cmstandr](https://mc-stan.org/cmdstanr/) works)

## Task 
Code for the task is in /public 

Mobile compatible version of a simple reward-effort decision-making task built using [phaser3](https://phaser.io/phaser3)

The task is a mobile optimised web-app hosted on Google's [Firebase](https://firebase.google.com/) web app hosting service, and saves data in a [Firestore](https://firebase.google.com/products/firestore) NoSQL database.  

Original created by [Dr Agnes Norbury](https://www.agnesnorbury.com/); [now published in Science Advances](https://www.science.org/doi/full/10.1126/sciadv.adk3222?af=R)

The game world was compiled using [Tiled](https://www.mapeditor.org/) using art assets by [kenney](https://kenney.nl/).

UI functionality was built using [rexUI plugins](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/) for phaser3.

This version is set up to connect with Brain Explorer app in the front-end in an ema study

People were sent notifications which would prompt them to open the link and an in app browser would load the game. 

You can play a demo of the game [here](https://ema-motivation.web.app/) (on your mobile!)

questions: s.hewitt.17@ucl.ac.uk

## Useful functions for firebase CLI
[see firebase docs for more info](https://firebase.google.com/docs/build)
### examples: host game in local browser via emulators 
```
cd reward-effort-2afc-firebase-EMA-motivation
firebase emulators:start 
```

#### preview game version via a channel (online)
```
cd reward-effort-2afc-firebase-EMA-motivation
firebase hosting:channel:deploy new-awesome-feature --expires 7d
```

#### push the channel (version) to live project url: 
```
firebase hosting:clone ema-motivation:new-awesome-feature ema-motivation:live
```

#### delete a channel 
```
firebase hosting:channel:delete new-awesome-feature
```
 

### delete data in cloud firestore 
```
firebase firestore:delete /rew-eff-ema/study1 -r
```

## Getting the local file server up and running
To avoid CORS issues we are using a small Express.js server to serve the files in the `public` folder to the mobile apps. Please ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (developed with node v20.11.1)
    - If you are using [nvm](https://github.com/nvm-sh/nvm) you can run `nvm use` in the `/public` directory to switch to the correct version of node as specified in the `.nvmrc` file.
- [npm](https://www.npmjs.com/) (developed with npm version v10.2.4)

1. Navigate to the `/public` folder
2. Switch to the required version of node
3. Start the server using `node index.js`

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
