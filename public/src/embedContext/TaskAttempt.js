export default class TaskAttempt {
    constructor(trialNo, trialStartTime, trialReward1, trialEffort1, trialEffortPropMax1, trialReward2, trialEffort2, trialEffortPropMax2, choice, choiceRT, pressCount, pressTimes, trialSuccess, coinsRunningTotal, trialEndTime, effortTimeLimit, recalibration, thresholdMax) {
        this.trialNo = trialNo;
        this.trialStartTime = trialStartTime;
        this.trialReward1 = trialReward1;
        this.trialEffort1 = trialEffort1;
        this.trialEffortPropMax1 = trialEffortPropMax1;
        this.trialReward2 = trialReward2;
        this.trialEffort2 = trialEffort2;
        this.trialEffortPropMax2 = trialEffortPropMax2;
        this.choice = choice;
        this.choiceRT = choiceRT;
        this.pressCount = pressCount;
        this.pressTimes = pressTimes;
        this.trialSuccess = trialSuccess;
        this.coinsRunningTotal = coinsRunningTotal;
        this.trialEndTime = trialEndTime;
        this.effortTimeLimit = effortTimeLimit;
        this.recalibration = recalibration;
        this.thresholdMax = thresholdMax;
    }

    stringify() {
        return JSON.stringify(this);
    }
}
