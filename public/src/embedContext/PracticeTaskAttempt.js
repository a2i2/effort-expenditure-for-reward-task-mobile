export default class PracticeTaskAttempt {
    constructor(pracTrial, selectedReward, selectedEffort, pressCount, pressTimes, trialSuccess, maxPressCount) {
        this.pracTrialNo = pracTrial
        this.trialReward = selectedReward
        this.trialEffort = selectedEffort
        this.pressCount = pressCount
        this.pressTimes = pressTimes
        this.trialSuccess = trialSuccess
        this.maxPressCount = maxPressCount
    }

    stringify() {
        console.log(JSON.stringify(this));
        return JSON.stringify(this);
    }
}
