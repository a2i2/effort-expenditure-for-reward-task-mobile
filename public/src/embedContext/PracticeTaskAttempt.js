export default class PracticeTaskAttempt {
    constructor(pracTrial, selectedReward, selectedEffort, pressCount, pressTimes, trialSuccess, maxPressCount, powerCountdown) {
        this.pracTrialNo = pracTrial
        this.trialReward = selectedReward
        this.trialEffort = selectedEffort
        this.pressCount = pressCount
        this.pressTimes = pressTimes
        this.trialSuccess = trialSuccess
        this.maxPressCount = maxPressCount
        this.powerCountdown = powerCountdown
    }

    stringify() {
        return JSON.stringify(this);
    }
}
