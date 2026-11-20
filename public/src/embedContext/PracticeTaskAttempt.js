export default class PracticeTaskAttempt {
    constructor(pracTrial, selectedReward, selectedEffort, pressCount, pressTimes, trialSuccess, maxPressCount, powerCountdown, choice) {
        this.pracTrialNo = pracTrial
        this.trialReward = selectedReward
        this.trialEffort = selectedEffort
        this.pressCount = pressCount
        this.pressTimes = pressTimes
        this.trialSuccess = trialSuccess
        this.maxPressCount = maxPressCount
        this.powerCountdown = powerCountdown
        this.choice = choice // 'route 1', 'route 2' or 'timeout'; null when no choice is offered
    }

    stringify() {
        return JSON.stringify(this);
    }
}
