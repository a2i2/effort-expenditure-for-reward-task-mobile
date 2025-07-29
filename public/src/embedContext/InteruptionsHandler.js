import { ARE_YOU_THERE_TAG, TIMEOUT_TAG } from "../elements/BottomScreenPanel";
import { taskRewardsPayoutThreshold, missedTrialDialogLimit } from "../versionInfo";

export default class InteruptionsHandler {
    static handleInteruption(context, cache) {
        if (cache == null || !cache.interruptionTimestamp) {
            return;
        }

        const twoMinsMs = 1000 * 60 * 2;
        const threeMinsMs = 1000 * 60 * 3;
        const fourMinsMs = 1000 * 60 * 4;
        const fiveMinsMs = 1000 * 60 * 5;
        const nTrials = 44;
        let interuptionLengthMs = Date.now() - cache.interruptionTimestamp;
        console.log('Interuption Seconds: ' + interuptionLengthMs / 1000);
        let completionThresholdTrialNo = Math.floor(taskRewardsPayoutThreshold * nTrials);

        // scenario 1 - interupted during practice rounds before main trials - restart from practice with no increment to attempt count
        if (cache.practiceComplete == false && cache.trialNumber == 0) {
            // show the exit dialog immedately after an interruption
            context.showExitDialogAfterInterruption();
            return;
        }

        // scenario 2 - interupted after practice but before the 2 calibration trials are complete:
        /*
            2A: Away for over 3 mins - task ends but allowed to return (infinately?)
            2B: Away for less than 3 mins - task still active, let them continue
        */
        if (cache.practiceComplete == true && cache.trialNumber <= 1) {
            // 2A
            if (interuptionLengthMs > threeMinsMs) {
                // show exit task dialog to let the user know they need to exit and return to the task from where they left off
                console.log('2A');
                context.taskRequiresRestart = false;
                context.interruptionExitTaskDialog = true;

                return;
            } else { // 2B
                console.log('2B');
                context.continueAfterInterruption();
                return; // let the user continue from where they are, no increment to attempt count
            }
        }

        // scenario 3 - interupted before reaching 80% threshold -
        /*
            3A: User returns while the are you still there dialog is active - let them continue only if they continue when the dialog would have been active.
            3B: User returns while the time out dialog is active but the additional 2 min timer is active - close the task and let them resume from where they left off (if first attempt)
            3C: User returns after the times out internal timer finishes (1 min for 3 timeouts, 2 mins for are you still there, 2 mins for times up dialog) - Restart the task from the beginning (if first attempt) or submit as complete if not first attempt
            3D: User is gone for 3-5 mins and there is no active dialog - show the are you still there dialog (or the times up dialog if shown before)
            3E: User is gone for over 5 mins and theres no active dialog - Show the Times up dialog and restart the task from the beginning (if first attempt) or submit as complete if not.
            3F: User is gone for less than 3 mins and theres no active dialog - dont let the user interract with the current trial and skip ahead to the next trial.
        */
        if (cache.trialNumber >= 2 && cache.trialNumber < completionThresholdTrialNo) {
            // 3A
            if (context.bottomScreenPanel && context.bottomScreenPanel.tag == ARE_YOU_THERE_TAG && interuptionLengthMs < twoMinsMs) {
                // let the user continue from where they are as the dialog would have been still active, no increment to attempt count
                // the timer will continue to tick down when they return so if they dont continue within the reminaing time they will get the times up dialog.
                console.log('3A-A');
                return;
            } else if (context.bottomScreenPanel && context.bottomScreenPanel.tag == ARE_YOU_THERE_TAG && interuptionLengthMs >= twoMinsMs && interuptionLengthMs < fourMinsMs) {
                // the user returned after the are you still there dialog would have timed out but before the time out dialogs 2 mins internal countdown has expired,
                // show the times up dialog andincrement attempt count. If they return before the 2 mins timeout occurs then they can countinue from where they left off
                console.log('3A-B');
                context.taskRequiresRestart = false;
                context.switchToTimesUpDialog();
                return;
            } else if (context.bottomScreenPanel && context.bottomScreenPanel.tag == ARE_YOU_THERE_TAG && interuptionLengthMs >= fourMinsMs) {
                // the user returned after both the are you still there and times up times up dialogs would have timed out,
                // show the times up dialog in its place and then increment attempt count and restart from the beginning
                console.log('3A-C');
                context.taskRequiresRestart = true;
                context.switchToTimesUpDialog();
                return;
            }

            // 3B
            if (context.bottomScreenPanel && context.bottomScreenPanel.tag == TIMEOUT_TAG && interuptionLengthMs < twoMinsMs) {
                // Increment attempt count. Keep the times up dialog active and let them manually exit via the dialog, if they trigger
                // the extra 2 min timeout then they will need to restart the task, otherwise let them continue from where they left off.
                console.log('3B');
                context.taskRequiresRestart = false;
                return;
            }

            // 3C
            if (context.bottomScreenPanel && context.bottomScreenPanel.tag == TIMEOUT_TAG && interuptionLengthMs >= twoMinsMs) {
                // The times out dialog internal timer would have timed out,
                // let the user manually exit via the dialog and restart the task from the beginning
                console.log('3C');
                context.taskRequiresRestart = true;
                return;
            }

            // 3D
            if (!context.bottomScreenPanel && interuptionLengthMs >= threeMinsMs && interuptionLengthMs < fiveMinsMs) {
                let numAreYouThereDialogsShown = context.missedTrialDialogsShown ?? 0;
                // if havent been shown the are you still there dialog, show it
                if (numAreYouThereDialogsShown < missedTrialDialogLimit) {
                    console.log('3D-A');
                    context.interruptionShowAreYouThereDialog = true;
                    context.continueAfterInterruption();
                } else {
                    console.log('3D-B');
                    // we've been shown the are you still there dialog too many times, show the times up dialog instead
                    context.interruptionShowTimesUpDialog = true;
                    context.continueAfterInterruption();
                }
                return;
            }

            // 3E
            if (!context.bottomScreenPanel && interuptionLengthMs >= fiveMinsMs) {
                console.log('3E');
                context.interruptionShowTimesUpDialog = true;
                context.taskRequiresRestart = true;
                context.continueAfterInterruption();
                return;
            }

            // 3F
            if (!context.bottomScreenPanel && interuptionLengthMs < threeMinsMs) {
                context.continueAfterInterruption();
                return;
            }
        }

        // scenario 4 - interupted after reaching 80% threshold -
        /*
            4A: User returns before 5 mins - Let them continue
            4B: User returns after 5 mins - Mark the task as complete and exit - survey is availiable
        */
        if (cache.trialNumber >= completionThresholdTrialNo && cache.trialNumber <= nTrials) {
            // 4A
            if (interuptionLengthMs < fiveMinsMs) {
                console.log('4A');
                context.continueAfterInterruption();
                return; // let the user continue without incrementing the attempt count, the task is considered done at this point.
            } else {
                // 4B
                // Note: While this scenario covers 4B there might be overlaps between this and scenario 3F-A -> 3F-D given the animations are allowed to continue
                // so here might be a double up in the logs here. Once they reach the end of the bridge the completion dialog is then shown and they can exit the game from there.
                console.log('4B');
                context.interruptionGameCompleteDialog = true;
                context.continueAfterInterruption();
                return;
            }
        }

        // Scenario 5 - interupted after the main trials are completed but before answering the feedback question - Show the feedback screens once only.
        // Handled in native apps
    }
}
