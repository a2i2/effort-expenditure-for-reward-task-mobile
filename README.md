# Effor Expenditure for Reward Task

This project takes the existing work from Dr Agnes Norbury [[1](#attributions)] and ports it to Android and iOS projects for easy testing and evaluation.

## Overview

The project is a stripped down version of the original fork, removing dependencies on Firebase and any analytics components to focus primarily on the task itself.
The Android and iOS projects are available in the `EEFRT Demo Android` and `EEFRT Demo iOS` folders respectively, and a simple Express.js server is available in the `public` folder.

## Getting the local file server up and running
To avoid CORS issues we are using a small Express.js server to serve the files in the `public` folder to the mobile apps. Please ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (developed with node v20.11.1)
    - If you are using [nvm](https://github.com/nvm-sh/nvm) you can run `nvm use` in the `/public` directory to switch to the correct version of node as specified in the `.nvmrc` file.
- [npm](https://www.npmjs.com/) (developed with npm version v10.2.4)

1. Navigate to the `/public` folder
2. Switch to the required version of node
3. Run `npm install` to install the required dependencies
4. Start the server using `node index.js`

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


## Attributions

1. Original created by [Dr Agnes Norbury](https://www.agnesnorbury.com/); published in [Science Advances](https://www.science.org/doi/full/10.1126/sciadv.adk3222?af=R)

2. The game world was compiled using [Tiled](https://www.mapeditor.org/) using art assets by [kenney](https://kenney.nl/). Based on the [phaser3](https://phaser.io/phaser3) and [rexUI plugins](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/).
