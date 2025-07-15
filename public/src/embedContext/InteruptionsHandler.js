import GameCache from "./GameCache";
import { ARE_YOU_THERE_TAG, TIMEOUT_TAG } from "../elements/BottomScreenPanel";
import { taskRewardsPayoutThreshold, missedTrialDialogLimit } from "../versionInfo";
import CloseMessage from "./CloseMessage";

export default class InteruptionsHandler {
    static handleInteruption(context, cache) {
        console.log('cache: ' + cache);
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
            let closeMessage = new CloseMessage(false, false, false);
            EmbedContext.sendMessage('close', closeMessage.stringify());
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
                // dont increment attempt count? Exit the task and let them return
                console.log('2A');
                let closeMessage = new CloseMessage(false, false, false);
                EmbedContext.sendMessage('close', closeMessage.stringify());
                return;
            } else { // 2B
                console.log('2B');
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
                // increment attempt count but they can countinue from where they left off
                console.log('3A-B');
                let closeMessage = new CloseMessage(false, true, false);
                EmbedContext.sendMessage('close', closeMessage.stringify());
                return;
            } else if (context.bottomScreenPanel && context.bottomScreenPanel.tag == ARE_YOU_THERE_TAG && interuptionLengthMs >= fourMinsMs) {
                // the user returned after both the are you still there and times up times up dialogs would have timed out,
                // increment attempt count and restart from the beginning
                console.log('3A-C');
                let closeMessage = new CloseMessage(false, true, true);
                EmbedContext.sendMessage('close', closeMessage.stringify());
                return;
            }

            // 3B
            if (context.bottomScreenPanel && context.bottomScreenPanel.tag == TIMEOUT_TAG && interuptionLengthMs < twoMinsMs) {
                // Increment attempt count. Exit the task and let them return where they left off if its their first attempt
                console.log('3B');
                let closeMessage = new CloseMessage(false, true, false);
                EmbedContext.sendMessage('close', closeMessage.stringify());
                return;
            }

            // 3C
            if (context.bottomScreenPanel && context.bottomScreenPanel.tag == TIMEOUT_TAG && interuptionLengthMs >= twoMinsMs) {
                // The times out dialog internal timer would have timed out, restart the task from the beginning
                console.log('3C');
                let closeMessage = new CloseMessage(false, true, true);
                EmbedContext.sendMessage('close', closeMessage.stringify());
                return;
            }

            // 3D
            if (!context.bottomScreenPanel && interuptionLengthMs >= threeMinsMs && interuptionLengthMs < fiveMinsMs) {
                let numAreYouThereDialogsShown = context.missedTrialDialogsShown ?? 0;
                console.log('3D');
                // if havent been shown the are you still there dialog, show it
                if (numAreYouThereDialogsShown < missedTrialDialogLimit) {
                    context.interruptionShowAreYouThereDialog = true;
                } else {
                    // we've been shown the are you still there dialog too many times, show the times up dialog instead
                    context.interruptionShowTimesUpDialog = true;
                }
                return;
            }

            // 3E
            if (!context.bottomScreenPanel && interuptionLengthMs >= fiveMinsMs) {
                console.log('3E');
                context.interruptionShowTimesUpDialog = true;
                context.taskRequiresRestart = true;
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
                return; // let the user continue without incrementing the attempt count, the task is considered done at this point.
            } else { // 4B
                console.log('4B');
                EmbedContext.sendMessage('gameComplete');
                return; // game is complete, exit immediately
            }
        }

        // Scenario 5 - interupted after the main trials are completed but before answering the feedback question - Show the feedback screens once only.
        // Handled in native apps
    }
}
