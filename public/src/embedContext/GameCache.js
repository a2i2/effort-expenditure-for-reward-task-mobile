export default class GameCache {
    constructor(practiceComplete, trialNumber, maxPressCount, coinRunningTotal, trialResults, randTrialsIdx) {
        this.practiceComplete = practiceComplete;
        this.trialNumber = trialNumber;
        this.maxPressCount = maxPressCount;
        this.coinRunningTotal = coinRunningTotal;
        this.trialResults = trialResults;
        this.randTrialsIdx = randTrialsIdx;
    }

    stringify() {
        return JSON.stringify(this);
    }
}
