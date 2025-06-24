export default class GameCache {
    static cache = null;

    constructor(practiceComplete, trialNumber, maxPressCount, coinRunningTotal, trialResults, randTrialsIdx, trialSeqFilename, calibrationComplete) {
        this.practiceComplete = practiceComplete;
        this.trialNumber = trialNumber;
        this.maxPressCount = maxPressCount;
        this.coinRunningTotal = coinRunningTotal;
        this.trialResults = trialResults;
        this.randTrialsIdx = randTrialsIdx;
        this.trialSeqFilename = trialSeqFilename;
        this.calibrationComplete = calibrationComplete;
    }

    stringify() {
        return JSON.stringify(this);
    }
}
